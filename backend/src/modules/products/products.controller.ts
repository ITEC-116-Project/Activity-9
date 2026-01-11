import { 
  Controller, Get, Post, Put, Delete, Body, Param, Query, 
  ParseIntPipe, UseInterceptors, UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

// Configure multer storage
const storage = diskStorage({
  destination: './uploads/products',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `product-${uniqueSuffix}${ext}`);
  },
});

const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

// Public endpoints
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get()
  findAll(@Query('search') search?: string, @Query('category') category?: string) {
    return this.productsService.findAll(search, category);
  }

  @Get(':id/can-rate')
  canRate(@Param('id', ParseIntPipe) id: number, @Query('userId', ParseIntPipe) userId: number) {
    return this.productsService.canUserRateProduct(id, userId);
  }

  @Get(':id/reviews')
  getReviews(@Param('id', ParseIntPipe) id: number, @Query('rating') rating?: string) {
    const ratingFilter = rating ? parseInt(rating) : undefined;
    return this.productsService.getProductReviews(id, ratingFilter);
  }

  @Get(':id/rating-breakdown')
  getRatingBreakdown(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getRatingBreakdown(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post(':id/rate')
  rateProduct(
    @Param('id', ParseIntPipe) id: number, 
    @Body('rating') rating: number,
    @Body('userId') userId: number,
    @Body('review') review?: string,
  ) {
    return this.productsService.rateProduct(id, rating, userId, review);
  }
}

// Admin endpoints
@Controller('api/admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage, fileFilter: imageFileFilter }))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createProductDto.image_url = `/uploads/products/${file.filename}`;
    }
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', { storage, fileFilter: imageFileFilter }))
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateProductDto.image_url = `/uploads/products/${file.filename}`;
    }
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
