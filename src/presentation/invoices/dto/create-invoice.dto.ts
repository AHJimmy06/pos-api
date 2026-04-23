import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: [1], type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  impuestoIds: number[];
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
}
