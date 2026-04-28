import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Teclado Mecánico' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1500.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: [1], required: false })
  @IsArray()
  @IsOptional()
  taxIds?: number[];
}
