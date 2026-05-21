import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { InvoiceStatus } from '../../../domain/enums/invoice-status.enum';

export class ChangeInvoiceStatusDto {
  @ApiProperty({
    example: InvoiceStatus.CONFIRMED,
    enum: InvoiceStatus,
    description: 'New status: CONFIRMED or CANCELLED',
  })
  @IsEnum(InvoiceStatus, {
    message: 'status must be either CONFIRMED or CANCELLED',
  })
  @IsNotEmpty()
  status: InvoiceStatus.CONFIRMED | InvoiceStatus.CANCELLED;
}
