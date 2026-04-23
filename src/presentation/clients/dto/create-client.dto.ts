import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Perez' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Av. Siempre Viva 123' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
