import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController, AdminOrdersController } from './orders.controller';
import { Order, OrderItem } from '../../typeorm/entities/order';
import { Cart } from '../../typeorm/entities/cart';
import { Product } from '../../typeorm/entities/product';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Cart, Product])],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
