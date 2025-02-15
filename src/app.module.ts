import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CardModule } from './card/card.module';

@Module({
  imports: [ProductsModule, CardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
