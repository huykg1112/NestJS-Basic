import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartItemsModule } from './modules/cart_items/cart_items.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { FavoriteProductsModule } from './modules/favorite_products/favorite_products.module';
import { InventorysModule } from './modules/inventorys/inventorys.module';
import { OrderItemsModule } from './modules/order_items/order_items.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ProductBatchesModule } from './modules/product_batches/product_batches.module';
import { ProductImagesModule } from './modules/product_images/product_images.module';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RolePermissionsModule } from './modules/role_permissions/role_permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Chỉ bật trong môi trường dev
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    ProductsModule,
    AuthModule,
    UserModule,
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    CategoriesModule,
    ProductImagesModule,
    ProductBatchesModule,
    OrdersModule,
    OrderItemsModule,
    ReviewsModule,
    FavoriteProductsModule,
    CartItemsModule,
    PaymentsModule,
    InventorysModule,
    TokensModule,
  ],
  controllers: [AppController],
  providers: [AppService], // Xóa JwtAuthGuard và TokenService
})
export class AppModule {}
