import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

@Controller('products') // Định nghĩa route /products
export class ProductsController {
  private products = [
    { id: 1, name: 'Táo', price: 10000 },
    { id: 2, name: 'Cam', price: 15000 },
  ];
  @Get()
  getAllProducts() {
    return this.products;
  }

  //   @Get(':id')
  //   getProduct(@Param('id') id: string) {
  //     return this.products.find((product) => product.id === Number(id));
  //   }
  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.products.find((p) => p.id === Number(id));
  }
  @Post()
  addProduct(@Body() product: { id: number; name: string; price: number }) {
    this.products.push(product);
    return { message: 'Sản phẩm đã được thêm!', product };
  }
  @Post('addListProduct')
  addListProduct(
    @Body() products: { id: number; name: string; price: number }[],
  ) {
    this.products.push(...products);
    return { message: 'Sản phẩm đã được thêm!', products };
  }

  @Put(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() product: { id: number; name: string; price: number },
  ) {
    const index = this.products.findIndex((p) => p.id === Number(id));
    this.products[index] = product;
    return { message: 'Sản phẩm đã được cập nhật!', product };
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    this.products = this.products.filter((p) => p.id !== Number(id));
    return { message: 'Sản phẩm đã được xóa!' };
  }
}
