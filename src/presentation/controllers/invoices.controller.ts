import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateInvoiceDto } from '../invoices/dto/create-invoice.dto';
import { CreateInvoiceCommand } from '../../application/invoices/commands/create-invoice.command';
import { Invoice } from '../../domain/invoices/entities/invoice.entity';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({
    status: 201,
    description: 'The invoice has been successfully created.',
  })
  async create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    return this.commandBus.execute(
      new CreateInvoiceCommand(
        createInvoiceDto.clientId,
        createInvoiceDto.items,
      ),
    );
  }
}
