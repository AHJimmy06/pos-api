import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';

import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CreateInvoiceDto } from '../invoices/dto/create-invoice.dto';
import { CreateInvoiceCommand } from '../../application/invoices/commands/create-invoice.command';
import { GetInvoicesQuery } from '../../application/invoices/queries/get-invoices.query';
import { GetInvoiceQuery } from '../../application/invoices/queries/get-invoice.query';
import { Invoice } from '../../domain/entities/invoice.entity';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { UserRole } from '../../domain/enums/user-role.enum';


@ApiTags('invoices')
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.ADMINISTRATOR, UserRole.SELLER)
  @ApiOperation({ summary: 'Create a new invoice' })

  @ApiResponse({
    status: 201,
    description: 'The invoice has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Business rule violation (e.g. insufficient stock).',
  })
  @ApiResponse({
    status: 404,
    description: 'Dependency not found (Client, Product or Tax).',
  })
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Req() req: Request & { user?: { id: number } },
  ): Promise<Invoice> {
    return this.commandBus.execute(
      new CreateInvoiceCommand(
        createInvoiceDto.clientId,
        createInvoiceDto.items,
        createInvoiceDto.status,
        req.user?.id,
        createInvoiceDto.subtotalSnapshot,
        createInvoiceDto.taxTotalSnapshot,
        createInvoiceDto.totalSnapshot,
      ),
    );
  }


  @Get()
  @ApiOperation({ summary: 'Get all invoices (paginated)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'searchId',
    required: false,
    type: Number,
    description: 'Filter by invoice ID',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('searchId') searchId?: string,
  ): Promise<{ data: Invoice[]; total: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const searchIdNum = searchId ? parseInt(searchId, 10) : undefined;
    return this.queryBus.execute(
      new GetInvoicesQuery(pageNum, limitNum, searchIdNum),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by id' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Invoice> {
    return this.queryBus.execute(new GetInvoiceQuery(id));
  }
}
