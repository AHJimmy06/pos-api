import { BusinessException } from '../exceptions/business.exception';

export class Percentage {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new BusinessException('Percentage must be between 0 and 100');
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }
}
