import { BusinessException } from '../exceptions/business.exception';

export class Stock {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new BusinessException('Stock cannot be negative');
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  add(quantity: number): Stock {
    return new Stock(this.value + quantity);
  }

  subtract(quantity: number): Stock {
    if (this.value < quantity) {
      throw new BusinessException('Insufficient stock');
    }
    return new Stock(this.value - quantity);
  }
}
