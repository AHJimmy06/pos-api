import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request, Response } from 'express';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateInvoiceDto } from '../invoices/dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../invoices/dto/update-invoice.dto';
import { ChangeInvoiceStatusDto } from '../invoices/dto/change-invoice-status.dto';
import { CreateInvoiceCommand } from '../../application/invoices/commands/create-invoice.command';
import { UpdateInvoiceCommand } from '../../application/invoices/commands/update-invoice.command';
import { ChangeInvoiceStatusCommand } from '../../application/invoices/commands/change-invoice-status.command';
import { GetInvoicesQuery } from '../../application/invoices/queries/get-invoices.query';
import { GetInvoiceQuery } from '../../application/invoices/queries/get-invoice.query';
import { Invoice } from '../../domain/entities/invoice.entity';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { UserRole } from '../../domain/enums/user-role.enum';
import { normalizePageSize } from '../../infrastructure/common/utils/page-size.util';
import { PdfService } from '../../infrastructure/common/services/pdf.service';
import { IClientRepository } from '../../domain/repositories/client.repository.interface';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@ApiTags('invoices')
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly pdfService: PdfService,
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
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

  @Patch(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.SELLER)
  @ApiOperation({ summary: 'Update a draft invoice' })
  @ApiResponse({
    status: 200,
    description: 'The invoice has been successfully updated.',
  })
  @ApiResponse({
    status: 409,
    description: 'Invoice is not in a modifiable state (not DRAFT).',
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Req() req: Request & { user?: { id: number } },
  ): Promise<Invoice> {
    return this.commandBus.execute(
      new UpdateInvoiceCommand(
        id,
        updateInvoiceDto.clientId,
        updateInvoiceDto.items,
        req.user?.id,
      ),
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change invoice status (confirm or cancel)' })
  @ApiResponse({
    status: 200,
    description: 'The invoice status has been successfully changed.',
  })
  @ApiResponse({
    status: 400,
    description: 'Business rule violation (e.g. insufficient stock).',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only administrators can cancel invoices.',
  })
  @ApiResponse({
    status: 409,
    description: 'Invalid status transition.',
  })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatusDto: ChangeInvoiceStatusDto,
    @Req() req: Request & { user?: { id: number; roles?: string[] } },
  ) {
    return this.commandBus.execute(
      new ChangeInvoiceStatusCommand(
        id,
        changeStatusDto.status,
        req.user?.id,
        req.user?.roles?.[0],
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
    @Req() req?: Request & { user?: { id: number; roles: string[] } },
  ): Promise<{ data: Invoice[]; total: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = normalizePageSize(limit);
    const searchIdNum = searchId ? parseInt(searchId, 10) : undefined;

    // Si es Vendedor, filtrar solo sus facturas. Administradores ven todas.
    const user = req?.user;
    const userIdFilter =
      user?.roles?.includes(UserRole.SELLER) &&
      !user?.roles?.includes(UserRole.ADMINISTRATOR)
        ? user.id
        : undefined;

    return this.queryBus.execute(
      new GetInvoicesQuery(pageNum, limitNum, searchIdNum, userIdFilter),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by id' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Invoice> {
    return this.queryBus.execute(new GetInvoiceQuery(id));
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Export invoice to PDF' })
  @ApiResponse({ status: 200, description: 'PDF generated' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async exportPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const invoice: Invoice = await this.queryBus.execute(
      new GetInvoiceQuery(id),
    );
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const client = await this.clientRepository.findById(invoice.clientId);
    const seller = invoice.userId
      ? await this.userRepository.findById(invoice.userId)
      : null;

    const buffer = await this.pdfService.generateInvoicePdf(
      invoice,
      client,
      seller,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
