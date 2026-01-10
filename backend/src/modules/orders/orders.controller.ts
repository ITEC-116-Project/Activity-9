import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Create order (checkout)
  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  // Get user's orders
  @Get()
  findAll(@Query('user_id', ParseIntPipe) userId: number) {
    return this.ordersService.findAll(userId, false);
  }

  // Get single order
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  // Cancel order
  @Delete(':id')
  cancelOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancelOrder(id);
  }
}

// Admin endpoints
@Controller('api/admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Get analytics
  @Get('analytics')
  getAnalytics() {
    return this.ordersService.getAnalytics();
  }

  // Get all orders (admin)
  @Get()
  findAll() {
    return this.ordersService.findAll(undefined, true);
  }

  // Update order status
  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }
}
