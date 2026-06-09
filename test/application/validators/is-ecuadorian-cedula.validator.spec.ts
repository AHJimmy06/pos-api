import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  IsEcuadorianCedula,
  isValidEcuadorianCedula,
} from '../../../src/application/common/validators/is-ecuadorian-cedula.validator';

class TestDto {
  @IsEcuadorianCedula()
  cedula!: string;
}

/**
 * Cédulas reales de ejemplo (verificadas con el algoritmo Módulo 10).
 * Generadas con: prefijo[0..8] + (10 - sum%10)%10 como dígito 10.
 *   - 1712345675  → provincia 17 (Pastaza)
 *   - 0925487415  → provincia 09 (Guayas)
 *   - 1756279020  → provincia 17 (Pastaza)
 *   - 1104567894  → provincia 11 (Loja)
 *   - 1717171712  → provincia 17 (Pastaza)
 *   - 0100000009  → provincia 01 (Azuay)
 *   - 3000000004  → provincia 30 (extranjero)
 */
const VALID_CEDULAS = [
  '1712345675',
  '0925487415',
  '1756279020',
  '1104567894',
  '1717171712',
  '0100000009',
  '3000000004',
];

const INVALID_CEDULAS = [
  '', // vacío
  '123', // muy corta
  '12345678901234', // muy larga
  '1712345670', // dígito verificador incorrecto
  '1712345679', // dígito verificador incorrecto
  '0012345678', // provincia 00 inválida
  '2512345678', // provincia 25 inválida
  '3112345678', // provincia 31 inválida
  '9912345678', // provincia 99 inválida
  '171234567a', // caracter no numérico
  'abcdefghij', // no numérica
  ' 1712345675', // espacio
  '1712345675 ', // espacio
  '1712345678', // check digit alterado de 1712345675
];

describe('isValidEcuadorianCedula (función pura)', () => {
  it.each(VALID_CEDULAS)('debe aceptar cédula válida: %s', (cedula) => {
    expect(isValidEcuadorianCedula(cedula)).toBe(true);
  });

  it.each(INVALID_CEDULAS)('debe rechazar cédula inválida: "%s"', (cedula) => {
    expect(isValidEcuadorianCedula(cedula)).toBe(false);
  });

  it('debe rechazar valores no-string', () => {
    expect(isValidEcuadorianCedula(1234567890)).toBe(false);
    expect(isValidEcuadorianCedula(null)).toBe(false);
    expect(isValidEcuadorianCedula(undefined)).toBe(false);
    expect(isValidEcuadorianCedula({})).toBe(false);
    expect(isValidEcuadorianCedula([])).toBe(false);
  });
});

describe('@IsEcuadorianCedula (decorador class-validator)', () => {
  it('no debe reportar errores para cédulas válidas', async () => {
    for (const cedula of VALID_CEDULAS) {
      const dto = plainToInstance(TestDto, { cedula });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    }
  });

  it('debe reportar error de formato para longitudes incorrectas', async () => {
    const dto = plainToInstance(TestDto, { cedula: '123' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('IsEcuadorianCedula');
    expect(errors[0].constraints?.IsEcuadorianCedula).toMatch(
      /10 dígitos numéricos/,
    );
  });

  it('debe reportar error de dígito verificador para cédulas con checksum inválido', async () => {
    const dto = plainToInstance(TestDto, { cedula: '1712345670' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.IsEcuadorianCedula).toMatch(
      /dígito verificador/,
    );
  });
});
