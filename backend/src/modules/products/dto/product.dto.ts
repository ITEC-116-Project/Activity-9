import { IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @Min(0, { message: 'Price must be at least 0' })
  price: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(0, { message: 'Stock must be at least 0' })
  stock: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => value !== undefined ? parseFloat(value) : undefined)
  @Min(0, { message: 'Price must be at least 0' })
  price?: number;

  @IsOptional()
  @Transform(({ value }) => value !== undefined ? parseInt(value, 10) : undefined)
  @Min(0, { message: 'Stock must be at least 0' })
  stock?: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
