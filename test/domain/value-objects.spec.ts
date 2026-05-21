import { Email } from '../../src/domain/value-objects/email.value-object';
import { Price } from '../../src/domain/value-objects/price.value-object';
import { Stock } from '../../src/domain/value-objects/stock.value-object';
import { BusinessException } from '../../src/domain/exceptions/business.exception';

describe('Value Objects', () => {
  describe('Email', () => {
    it('should create a valid email', () => {
      const email = new Email('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw BusinessException for invalid email', () => {
      expect(() => new Email('invalid-email')).toThrow(BusinessException);
    });
  });

  describe('Price', () => {
    it('should create a valid price', () => {
      const price = new Price(100);
      expect(price.getValue()).toBe(100);
    });

    it('should throw BusinessException for negative price', () => {
      expect(() => new Price(-1)).toThrow(BusinessException);
    });
  });

  describe('Stock', () => {
    it('should subtract stock correctly', () => {
      const stock = new Stock(10);
      const newStock = stock.subtract(4);
      expect(newStock.getValue()).toBe(6);
    });

    it('should throw BusinessException when subtracting more than available', () => {
      const stock = new Stock(5);
      expect(() => stock.subtract(10)).toThrow(BusinessException);
    });
  });
});
