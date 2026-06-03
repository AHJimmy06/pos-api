import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { InvoiceStatus } from '../../../domain/enums/invoice-status.enum';

export class TaxSnapshotDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  taxId: number;

  @ApiProperty({ example: 21 })
  @IsNumber()
  rate: number;

  @ApiProperty({ example: 945 })
  @IsNumber()
  calculatedAmount: number;
}

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 'Cerveza', required: false })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 1500, required: false })
  @IsInt()
  @IsOptional()
  unitPrice?: number;

  @ApiProperty({ example: 4500, required: false })
  @IsInt()
  @IsOptional()
  subtotal?: number;

  @ApiProperty({ type: [TaxSnapshotDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TaxSnapshotDto)
  taxes?: TaxSnapshotDto[];

  @ApiProperty({ example: [1], type: [Number], required: false })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  impuestoIds?: number[];
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  clientId: number;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @ApiProperty({
    example: InvoiceStatus.CONFIRMED,
    enum: InvoiceStatus,
    required: false,
  })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiProperty({ example: 4500, required: false })
  @IsNumber()
  @IsOptional()
  subtotalSnapshot?: number;

  @ApiProperty({ example: 945, required: false })
  @IsNumber()
  @IsOptional()
  taxTotalSnapshot?: number;

  @ApiProperty({ example: 5445, required: false })
  @IsNumber()
  @IsOptional()
  totalSnapshot?: number;
}
