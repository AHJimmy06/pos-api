import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';

/**
 * Regla de dominio: `cedula` es write-once.
 * Se setea en el create del cliente y no puede modificarse
 * ni limpiarse en updates posteriores. OmitType la excluye del
 * DTO de update para que la API ni siquiera la reciba.
 */
export class UpdateClientDto extends PartialType(
  OmitType(CreateClientDto, ['cedula'] as const),
) {}
