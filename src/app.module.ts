import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CardModule } from './card/card.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ProductsModule, CardModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
