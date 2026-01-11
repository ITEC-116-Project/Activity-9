import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderItem, OrderStatus, PaymentMethod } from '../../typeorm/entities/order';
import { Cart } from '../../typeorm/entities/cart';
import { Product } from '../../typeorm/entities/product';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  // Generate unique order number
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  // Create order from cart (checkout)
  async createOrder(createOrderDto: CreateOrderDto) {
    const { user_id, shipping_address, payment_method, selected_cart_ids } = createOrderDto;

    // Get user's cart
    let cartItems = await this.cartRepository.find({
      where: { user_id },
      relations: ['product'],
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Filter cart items if specific items are selected
    if (selected_cart_ids && selected_cart_ids.length > 0) {
      cartItems = cartItems.filter(item => selected_cart_ids.includes(item.id));
      if (cartItems.length === 0) {
        throw new BadRequestException('No valid cart items selected');
      }
    }

    // Validate stock for all items
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`,
        );
      }
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    // Use transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create order
      const order = this.orderRepository.create({
        user_id,
        order_number: this.generateOrderNumber(),
        total_amount: totalAmount,
        status: OrderStatus.PENDING,
        payment_method: payment_method || PaymentMethod.COD,
        shipping_address,
      });

      await queryRunner.manager.save(order);

      // Create order items and deduct stock
      for (const cartItem of cartItems) {
        // Create order item
        const orderItem = this.orderItemRepository.create({
          order_id: order.id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
        });
        await queryRunner.manager.save(orderItem);

        // Deduct stock
        await queryRunner.manager.update(Product, cartItem.product_id, {
          stock: cartItem.product.stock - cartItem.quantity,
        });
      }

      // Clear only the checked out cart items
      const cartIdsToDelete = cartItems.map(item => item.id);
      for (const cartId of cartIdsToDelete) {
        await queryRunner.manager.delete(Cart, { id: cartId });
      }

      await queryRunner.commitTransaction();

      // Fetch complete order with items
      const completeOrder = await this.findOne(order.id);

      return {
        message: 'Order placed successfully',
        order: completeOrder,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Get all orders (admin) or user's orders (customer)
  async findAll(userId?: number, isAdmin?: boolean) {
    const where = isAdmin ? {} : { user_id: userId };
    
    return this.orderRepository.find({
      where,
      relations: ['order_items', 'order_items.product', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  // Get single order
  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['order_items', 'order_items.product', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // Update order status (admin only)
  async updateStatus(id: number, updateStatusDto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    const currentStatus = order.status;
    const newStatus = updateStatusDto.status;

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${currentStatus} to ${newStatus}`
      );
    }

    // Set status-specific timestamps
    const now = new Date();
    switch (newStatus) {
      case OrderStatus.PROCESSING:
        order.processed_at = now;
        break;
      case OrderStatus.SHIPPED:
        order.shipped_at = now;
        break;
      case OrderStatus.DELIVERED:
        order.delivered_at = now;
        break;
      case OrderStatus.CANCELLED:
        order.cancelled_at = now;
        break;
    }

    order.status = newStatus;
    await this.orderRepository.save(order);

    return {
      message: 'Order status updated',
      order,
    };
  }

  // Cancel order (restore stock)
  async cancelOrder(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['order_items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order already cancelled');
    }

    // Use transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Restore stock for each item
      for (const item of order.order_items) {
        const product = await this.productRepository.findOne({ where: { id: item.product_id } });
        if (product) {
          await queryRunner.manager.update(Product, item.product_id, {
            stock: product.stock + item.quantity,
          });
        }
      }

      // Update order status
      order.status = OrderStatus.CANCELLED;
      order.cancelled_at = new Date();
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return {
        message: 'Order cancelled successfully',
        order,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Get analytics for admin dashboard
  async getAnalytics() {
    // Total revenue (from delivered orders)
    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'total')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .getRawOne();

    // Total orders count by status
    const ordersCount = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .getRawMany();

    // Total orders
    const totalOrders = await this.orderRepository.count();

    // Pending orders
    const pendingOrders = await this.orderRepository.count({
      where: { status: OrderStatus.PENDING },
    });

    // Total products
    const totalProducts = await this.productRepository.count();

    // Low stock products (stock < 10)
    const lowStockProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stock < :stock', { stock: 10 })
      .getCount();

    // Recent orders (last 5)
    const recentOrders = await this.orderRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 5,
    });

    // Top selling products
    const topProducts = await this.orderItemRepository
      .createQueryBuilder('item')
      .select('item.product_id', 'product_id')
      .addSelect('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'total_sold')
      .innerJoin('item.product', 'product')
      .groupBy('item.product_id')
      .addGroupBy('product.name')
      .orderBy('total_sold', 'DESC')
      .limit(5)
      .getRawMany();

    // Monthly revenue (last 6 months)
    const monthlyRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select("DATE_FORMAT(order.created_at, '%Y-%m')", 'month')
      .addSelect('SUM(order.total_amount)', 'revenue')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere('order.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      totalRevenue: Number(revenueResult?.total) || 0,
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      ordersCount,
      recentOrders,
      topProducts,
      monthlyRevenue,
    };
  }
}
