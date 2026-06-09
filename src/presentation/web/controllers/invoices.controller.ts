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
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  ChangeInvoiceStatusDto,
} from '../../../application/dto/invoices';
import { CreateInvoiceCommand } from '../../../application/invoices/create-invoice.command';
import { UpdateInvoiceCommand } from '../../../application/invoices/update-invoice.command';
import { ChangeInvoiceStatusCommand } from '../../../application/invoices/change-invoice-status.command';
import { GetInvoicesQuery } from '../../../application/invoices/get-invoices.query';
import { GetInvoiceQuery } from '../../../application/invoices/get-invoice.query';
import { GetInvoiceByNumberQuery } from '../../../application/invoices/get-invoice-by-number.query';
import { Invoice } from '../../../domain/entities/invoice.entity';
import { JwtAuthGuard } from '../../../infrastructure/security/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../../infrastructure/security/decorators/roles.decorator';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { normalizePageSize } from '../../../infrastructure/web-common/utils/page-size.util';
import { PdfService } from '../../../infrastructure/web-common/services/pdf.service';
import { IClientRepository } from '../../../application/common/interfaces/client.repository.interface';
import { IUserRepository } from '../../../application/common/interfaces/user.repository.interface';
import { TOKENS } from '../../../application/common/tokens/tokens';

import { InvoiceReconstructionDto } from '../../../application/dto/invoices/get-invoice-by-number.dto';
import { Client } from '../../../domain/entities/client.entity';
import { User } from '../../../domain/entities/user.entity';

@ApiTags('invoices')
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly pdfService: PdfService,
    @Inject(TOKENS.CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(TOKENS.USER_REPOSITORY)
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
  @ApiOperation({
    summary:
      'Modify an invoice (generates a new revision and cancels the old one)',
  })
  @ApiResponse({
    status: 200,
    description: 'The invoice has been successfully revised.',
  })
  @ApiResponse({
    status: 409,
    description: 'Invoice is already cancelled and cannot be modified.',
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
  @ApiOperation({ summary: 'Get an invoice by id with client and seller' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    const invoice: Invoice | null = await this.queryBus.execute(
      new GetInvoiceQuery(id),
    );
    if (!invoice) {
      return null;
    }

    // Get client and seller info
    const client = invoice.clientId
      ? await this.clientRepository.findById(Number(invoice.clientId))
      : null;
    const seller = invoice.userId
      ? await this.userRepository.findById(Number(invoice.userId))
      : null;

    return {
      ...invoice,
      client: {
        id: invoice.clientId,
        firstName:
          invoice.clientNameSnapshot?.split(' ')[0] || client?.firstName,
        lastName:
          invoice.clientNameSnapshot?.split(' ').slice(1).join(' ') ||
          client?.lastName,
        email: invoice.clientEmailSnapshot || client?.email,
        phone: client?.phone,
        address: client?.address,
      },
      seller: {
        id: invoice.userId,
        username: seller?.username || 'N/A',
        name: invoice.sellerNameSnapshot?.split(' ')[0] || seller?.name,
        lastName:
          invoice.sellerNameSnapshot?.split(' ').slice(1).join(' ') ||
          seller?.lastName,
        email: seller?.email || 'N/A',
      },
    };
  }

  @Get('by-number/:invoiceNumber')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({
    summary: 'Reconstruct an invoice by its invoice number (for audit)',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async findByInvoiceNumber(
    @Param('invoiceNumber') invoiceNumber: string,
  ): Promise<any> {
    return this.queryBus.execute(new GetInvoiceByNumberQuery(invoiceNumber));
  }

  @Get('by-number/:invoiceNumber/pdf')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Export invoice PDF by invoice number (for audit)' })
  @ApiResponse({ status: 200, description: 'PDF generated' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async exportPdfByNumber(
    @Param('invoiceNumber') invoiceNumber: string,
    @Res() res: Response,
  ) {
    const invoiceData: InvoiceReconstructionDto | null =
      await this.queryBus.execute(new GetInvoiceByNumberQuery(invoiceNumber));
    if (!invoiceData) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Reconstruct minimal Invoice entity for PDF service
    const invoice: Invoice = new Invoice(invoiceData.client?.id || 0);
    invoice.id = invoiceData.id;
    invoice.issueDate = new Date(invoiceData.issueDate);
    invoice.status = invoiceData.status as any;
    invoice.paymentMethod = invoiceData.paymentMethod as any;
    invoice.transactionId = invoiceData.transactionId || '';
    invoice.setSnapshots(
      invoiceData.subtotalSnapshot,
      invoiceData.taxTotalSnapshot,
      invoiceData.totalSnapshot,
    );
    invoice.clientNameSnapshot = invoiceData.clientNameSnapshot;
    invoice.clientEmailSnapshot = invoiceData.clientEmailSnapshot;
    invoice.sellerNameSnapshot = invoiceData.sellerNameSnapshot;

    const buffer = await this.pdfService.generateInvoicePdf(
      invoice,
      invoiceData.client as unknown as Client,
      invoiceData.seller as unknown as User,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${invoiceNumber}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
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
