import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { CreateProductCommand } from '../../application/products/commands/create-product.command';
import { UpdateProductCommand } from '../../application/products/commands/update-product.command';
import { DeleteProductCommand } from '../../application/products/commands/delete-product.command';
import { GetProductsQuery } from '../../application/products/queries/get-products.query';
import { GetProductQuery } from '../../application/products/queries/get-product.query';
import { Product } from '../../domain/entities/product.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Business rule violation.' })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.commandBus.execute(
      new CreateProductCommand(
        createProductDto.name,
        createProductDto.price,
        createProductDto.stock,
        createProductDto.taxIds,
      ),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  async findAll(): Promise<Product[]> {
    return this.queryBus.execute(new GetProductsQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.queryBus.execute(new GetProductQuery(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 400, description: 'Business rule violation.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.commandBus.execute(
      new UpdateProductCommand(id, updateProductDto),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commandBus.execute(new DeleteProductCommand(id));
  }
}
