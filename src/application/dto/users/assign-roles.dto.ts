import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesDto {
  @ApiProperty({
    description: 'Array of role IDs to assign to the user',
    example: [1, 2],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'User must have at least one role' })
  @IsNumber({}, { each: true })
  roleIds: number[];
}
