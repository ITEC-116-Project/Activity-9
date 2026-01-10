import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../../typeorm/entities/product';
import { Order, OrderItem, OrderStatus } from '../../typeorm/entities/order';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  // Get all distinct categories
  async getCategories() {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.category IS NOT NULL')
      .andWhere("product.category != ''")
      .getRawMany();
    
    return products.map(p => p.category).filter(Boolean);
  }

  // Get all products (public)
  async findAll(search?: string, category?: string) {
    const where: any = {};
    
    if (search) {
      where.name = Like(`%${search}%`);
    }
    
    if (category) {
      where.category = category;
    }

    return this.productRepository.find({ where, order: { created_at: 'DESC' } });
  }

  // Get single product (public)
  async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  // Create product (admin only)
  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    await this.productRepository.save(product);
    return {
      message: 'Product created successfully',
      product,
    };
  }

  // Update product (admin only)
  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    
    await this.productRepository.update(id, updateProductDto);
    
    const updatedProduct = await this.findOne(id);
    return {
      message: 'Product updated successfully',
      product: updatedProduct,
    };
  }

  // Delete product (admin only)
  async remove(id: number) {
    const product = await this.findOne(id);
    await this.productRepository.delete(id);
    return {
      message: 'Product deleted successfully',
    };
  }

  // Update stock (internal use)
  async updateStock(id: number, quantity: number) {
    const product = await this.findOne(id);
    const newStock = product.stock + quantity;
    
    if (newStock < 0) {
      throw new NotFoundException('Insufficient stock');
    }

    await this.productRepository.update(id, { stock: newStock });
    return this.findOne(id);
  }

  // Check if user can rate a product (must have delivered order with this product)
  async canUserRateProduct(productId: number, userId: number) {
    // Find delivered orders for this user that contain this product
    const deliveredOrder = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.order_items', 'item')
      .where('order.user_id = :userId', { userId })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere('item.product_id = :productId', { productId })
      .getOne();

    return {
      canRate: !!deliveredOrder,
      message: deliveredOrder 
        ? 'You can rate this product' 
        : 'You can only rate products from delivered orders',
    };
  }

  // Rate product
  async rateProduct(id: number, rating: number, userId: number) {
    const product = await this.findOne(id);
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if user can rate this product
    const canRate = await this.canUserRateProduct(id, userId);
    if (!canRate.canRate) {
      throw new BadRequestException('You can only rate products from delivered orders');
    }

    // Calculate new average rating
    const currentTotal = Number(product.rating) * product.rating_count;
    const newCount = product.rating_count + 1;
    const newRating = (currentTotal + rating) / newCount;

    await this.productRepository.update(id, { 
      rating: Math.round(newRating * 10) / 10, 
      rating_count: newCount 
    });

    const updatedProduct = await this.findOne(id);
    return {
      message: 'Thank you for your rating!',
      product: updatedProduct,
    };
  }
}
