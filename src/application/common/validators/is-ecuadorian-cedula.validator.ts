import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Cédula de identidad ecuatoriana.
 *
 * Formato: 10 dígitos numéricos.
 *   - Primeros 2: código de provincia (01-24, o 30 para extranjeros).
 *   - Dígito 10: check digit calculado con Módulo 10 sobre los primeros 9.
 *
 * Algoritmo del check digit (Módulo 10):
 *   1. Multiplicar los primeros 9 dígitos por coeficientes [2,1,2,1,2,1,2,1,2].
 *   2. Si el producto ≥ 10, restar 9.
 *   3. Sumar todos los resultados.
 *   4. check_digit = (10 - (suma % 10)) % 10
 *   5. La cédula es válida si el dígito 10 coincide.
 *
 * La función pura `isValidEcuadorianCedula` se exporta aparte para poder
 * reutilizarla en seed, scripts, o el frontend, sin acoplar a class-validator.
 */
export function isValidEcuadorianCedula(cedula: unknown): boolean {
  if (typeof cedula !== 'string') return false;
  if (!/^\d{10}$/.test(cedula)) return false;

  // Provincia válida: 01-24 (24 provincias del Ecuador) o 30 (extranjeros).
  const province = parseInt(cedula.substring(0, 2), 10);
  if (province < 1 || (province > 24 && province !== 30)) return false;

  // Módulo 10 sobre los primeros 9 dígitos.
  const digits = cedula.split('').map(Number);
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const product = digits[i] * coefficients[i];
    sum += product >= 10 ? product - 9 : product;
  }
  const expectedCheckDigit = (10 - (sum % 10)) % 10;
  return expectedCheckDigit === digits[9];
}

@ValidatorConstraint({ name: 'IsEcuadorianCedula', async: false })
export class IsEcuadorianCedulaConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isValidEcuadorianCedula(value);
  }

  defaultMessage(args: ValidationArguments): string {
    const value = args.value as unknown;
    if (typeof value !== 'string' || !/^\d{10}$/.test(value)) {
      return `${args.property} debe tener exactamente 10 dígitos numéricos`;
    }
    return `${args.property} no es una cédula ecuatoriana válida (dígito verificador incorrecto)`;
  }
}

export function IsEcuadorianCedula(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEcuadorianCedulaConstraint,
    });
  };
}
