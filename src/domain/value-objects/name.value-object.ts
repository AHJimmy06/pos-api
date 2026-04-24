import { BusinessException } from '../exceptions/business.exception';

export class Name {
  private readonly value: string;

  constructor(value: string, minLength: number = 2) {
    if (!value || value.trim().length < minLength) {
      throw new BusinessException(
        `Name must be at least ${minLength} characters long`,
      );
    }
    this.value = value.trim();
  }

  getValue(): string {
    return this.value;
  }
}
