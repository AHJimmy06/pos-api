import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateTaxDto {
  @ApiProperty({ example: 'IVA' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 0.21 })
  @IsNumber()
  @Min(0)
  currentRate: number;
}
