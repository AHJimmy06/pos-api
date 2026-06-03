import { ApiProperty } from '@nestjs/swagger';

export class DeleteResultDto {
  @ApiProperty({ description: 'The ID of the deleted entity' })
  id: number;

  @ApiProperty({
    description: 'Type of deletion performed',
    enum: ['physical', 'soft'],
  })
  deleteType: 'physical' | 'soft';

  @ApiProperty({ description: 'Human-readable message' })
  message: string;
}
