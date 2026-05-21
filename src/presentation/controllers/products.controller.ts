import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { CreateProductCommand } from '../../application/products/commands/create-product.command';
import { UpdateProductCommand } from '../../application/products/commands/update-product.command';
import { DeleteProductCommand } from '../../application/products/commands/delete-product.command';
import { GetProductsQuery } from '../../application/products/queries/get-products.query';
import { GetProductQuery } from '../../application/products/queries/get-product.query';
import { Product } from '../../domain/entities/product.entity';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { UserRole } from '../../domain/enums/user-role.enum';

@ApiTags('products')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
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
  @Roles(UserRole.ADMINISTRATOR, UserRole.SELLER)
  @ApiOperation({ summary: 'Get all products' })
  async findAll(): Promise<Product[]> {
    return this.queryBus.execute(new GetProductsQuery());
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.SELLER)
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.queryBus.execute(new GetProductQuery(id));
  }

  @Put(':id')
  @Roles(UserRole.ADMINISTRATOR)
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
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commandBus.execute(new DeleteProductCommand(id));
  }
}

