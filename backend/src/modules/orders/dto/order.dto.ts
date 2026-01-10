import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { OrderStatus, PaymentMethod } from '../../../typeorm/entities/order';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  shipping_address: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @IsOptional()
  @IsArray()
  selected_cart_ids?: number[];
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
