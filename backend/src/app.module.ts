import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    // ✅ Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ✅ Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true, // automatically load entities
        synchronize: true, // ⚠️ only for dev (creates tables automatically)
      }),
    }),

    // ✅ Feature modules
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,

    // ✅ Seed module (creates default admin)
    SeedModule,
  ],
})
export class AppModule {}
