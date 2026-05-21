import { Product } from '../../src/domain/entities/product.entity';
import { BusinessException } from '../../src/domain/exceptions/business.exception';

describe('Product Entity', () => {
  it('should create a valid product', () => {
    const product = new Product('Laptop', 1500, 10);
    expect(product.name).toBe('Laptop');
    expect(product.price).toBe(1500);
    expect(product.stock).toBe(10);
  });

  it('should reduce stock correctly', () => {
    const product = new Product('Mouse', 20, 50);
    product.reduceStock(10);
    expect(product.stock).toBe(40);
  });

  it('should throw exception when reducing more stock than available', () => {
    const product = new Product('Mouse', 20, 5);
    expect(() => product.reduceStock(10)).toThrow(BusinessException);
    expect(() => product.reduceStock(10)).toThrow('Insufficient stock');
  });

  it('should throw exception for invalid price', () => {
    expect(() => new Product('Invalid', -10, 10)).toThrow(BusinessException);
  });
});
