import { BusinessException } from '../exceptions/business.exception';

export class Price {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new BusinessException('Price cannot be negative');
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }
}
