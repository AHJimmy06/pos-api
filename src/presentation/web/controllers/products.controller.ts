import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateProductDto } from '../../products/dto/create-product.dto';
import { UpdateProductDto } from '../../products/dto/update-product.dto';
import { CreateProductCommand } from '../../../application/products/create-product.command';
import { UpdateProductCommand } from '../../../application/products/update-product.command';
import { DeleteProductCommand } from '../../../application/products/delete-product.command';
import { GetProductsQuery } from '../../../application/products/get-products.query';
import { GetProductQuery } from '../../../application/products/get-product.query';
import { GetProductsForSaleQuery } from '../../../application/products/get-products-for-sale.query';
import { Product } from '../../../domain/entities/product.entity';
import { JwtAuthGuard } from '../../../infrastructure/security/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../../infrastructure/security/decorators/roles.decorator';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { normalizePageSize } from '../../../infrastructure/web-common/utils/page-size.util';
import { DeleteResultDto } from '../../common/dto/delete-result.dto';

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
  @ApiOperation({ summary: 'Get all products (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Page size: 10, 15, 20, or 30',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<{ data: Product[]; total: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = normalizePageSize(limit);
    return this.queryBus.execute(
      new GetProductsQuery(pageNum, limitNum, search),
    );
  }

  @Get('for-sale')
  @Roles(UserRole.ADMINISTRATOR, UserRole.SELLER)
  @ApiOperation({
    summary: 'Get products available for sale (active + stock > 0)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Page size: 10, 15, 20, or 30',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  async findForSale(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
  ): Promise<{ data: Product[]; total: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = normalizePageSize(limit);
    return this.queryBus.execute(
      new GetProductsForSaleQuery(pageNum, limitNum, search, searchField),
    );
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
  @ApiOperation({
    summary: 'Delete a product (physical if no history, soft otherwise)',
  })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteResultDto> {
    return this.commandBus.execute(new DeleteProductCommand(id));
  }
}
