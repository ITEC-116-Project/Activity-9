import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../../typeorm/entities/cart';
import { Product } from '../../typeorm/entities/product';
import { AddToCartDto, UpdateCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // Get user's cart
  async getCart(userId: number) {
    const cartItems = await this.cartRepository.find({
      where: { user_id: userId },
      relations: ['product'],
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    return {
      items: cartItems,
      total: Number(total.toFixed(2)),
    };
  }

  // Add item to cart
  async addToCart(addToCartDto: AddToCartDto) {
    const { user_id, product_id, quantity } = addToCartDto;

    // Check if product exists and has enough stock
    const product = await this.productRepository.findOne({ where: { id: product_id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${product.stock}`);
    }

    // Check if item already in cart
    let cartItem = await this.cartRepository.findOne({
      where: { user_id, product_id },
    });

    if (cartItem) {
      // Update quantity
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${product.stock}`);
      }
      cartItem.quantity = newQuantity;
    } else {
      // Create new cart item
      cartItem = this.cartRepository.create({ user_id, product_id, quantity });
    }

    await this.cartRepository.save(cartItem);

    return {
      message: 'Item added to cart',
      cartItem,
    };
  }

  // Update cart item quantity
  async updateCartItem(cartId: number, updateCartDto: UpdateCartDto) {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Check stock
    if (cartItem.product.stock < updateCartDto.quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${cartItem.product.stock}`);
    }

    cartItem.quantity = updateCartDto.quantity;
    await this.cartRepository.save(cartItem);

    return {
      message: 'Cart updated',
      cartItem,
    };
  }

  // Remove item from cart
  async removeFromCart(cartId: number) {
    const cartItem = await this.cartRepository.findOne({ where: { id: cartId } });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.delete(cartId);
    return {
      message: 'Item removed from cart',
    };
  }

  // Clear user's cart (used after checkout)
  async clearCart(userId: number) {
    await this.cartRepository.delete({ user_id: userId });
    return {
      message: 'Cart cleared',
    };
  }
}
