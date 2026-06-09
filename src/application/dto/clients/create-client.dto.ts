import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsEcuadorianCedula } from '../../common/validators/is-ecuadorian-cedula.validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Perez' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '1712345678',
    description:
      'Cédula ecuatoriana de 10 dígitos (con dígito verificador válido)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @IsEcuadorianCedula()
  cedula: string;

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
