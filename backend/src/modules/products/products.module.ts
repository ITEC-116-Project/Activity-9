import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController, AdminProductsController } from './products.controller';
import { Product } from '../../typeorm/entities/product';
import { Order, OrderItem } from '../../typeorm/entities/order';
import { ProductRating } from '../../typeorm/entities/product-rating';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Order, OrderItem, ProductRating])],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
