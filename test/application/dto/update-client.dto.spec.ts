import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateClientDto } from '../../../src/application/dto/clients/update-client.dto';

/**
 * Estos tests reflejan el contrato real expuesto por el
 * ValidationPipe global de main.ts (whitelist: true,
 * forbidNonWhitelisted: true, transform: true).
 *
 * Regla de dominio: cedula es write-once. Por eso:
 * 1. El DTO de update NO declara `cedula` (OmitType).
 * 2. El pipe rechaza con 400 cualquier intento de mandar
 *    `cedula` en el body (forbidNonWhitelisted).
 */
describe('UpdateClientDto', () => {
  it('should NOT expose cedula as an own property', () => {
    const dto = new UpdateClientDto();
    expect(dto).not.toHaveProperty('cedula');
  });

  it('should validate allowed update fields (firstName, lastName, phone, address, email)', async () => {
    const raw = {
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '0991234567',
      address: 'Av. Siempre Viva 123',
      email: 'juan@example.com',
    };
    const dto = plainToInstance(UpdateClientDto, raw);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept partial updates (cualquier subset de los campos permitidos)', async () => {
    const dto = plainToInstance(UpdateClientDto, { phone: '0991112223' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.phone).toBe('0991112223');
  });

  it('should reject cedula in the request body via class-validator', async () => {
    // El DTO no declara cedula, así que class-validator no lo
    // reconoce como propiedad válida. El forbidNonWhitelisted del
    // pipe lo convierte en 400 BadRequest con "property cedula
    // should not exist".
    const raw = {
      firstName: 'Juan',
      cedula: '99999999', // intento de modificación
    };
    const dto = plainToInstance(UpdateClientDto, raw);
    const dtoShape = dto as unknown as Record<string, unknown>;

    // class-validator reporta la propiedad como "whitelistValidation"
    // cuando forbidNonWhitelisted está activo.
    const errors = await validate(dto as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    const cedulaError = errors.find(
      (e) =>
        e.property === 'cedula' || e.property === dtoShape.cedula?.toString(),
    );
    expect(cedulaError).toBeDefined();
    expect(cedulaError?.constraints?.whitelistValidation).toBe(
      'property cedula should not exist',
    );
  });
});
