import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartDto } from './dto/cart.dto';

@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Get user's cart
  @Get()
  getCart(@Query('user_id', ParseIntPipe) userId: number) {
    return this.cartService.getCart(userId);
  }

  // Add item to cart
  @Post()
  addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(addToCartDto);
  }

  // Update cart item quantity
  @Put(':id')
  updateCartItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.updateCartItem(id, updateCartDto);
  }

  // Remove item from cart
  @Delete(':id')
  removeFromCart(@Param('id', ParseIntPipe) id: number) {
    return this.cartService.removeFromCart(id);
  }
}
