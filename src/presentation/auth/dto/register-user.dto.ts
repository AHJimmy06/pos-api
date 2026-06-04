import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../domain/enums/user-role.enum';

export class RegisterUserDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @Length(3, 50)
  username: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'V-12345678', required: false })
  @IsOptional()
  @IsString()
  cedula?: string;

  @ApiProperty({ example: 'user@pos.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password1@',
    description: '8-10 chars, 1 upper, 1 lower, 1 number, 1 special',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/,
    {
      message:
        'Password must be 8-10 chars with 1 upper, 1 lower, 1 number, 1 special',
    },
  )
  password: string;

  @ApiProperty({
    example: ['SELLER'],
    description: 'User roles array',
    required: false,
    enum: UserRole,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: UserRole[];
}
