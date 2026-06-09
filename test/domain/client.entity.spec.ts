import { Client } from '../../src/domain/entities/client.entity';
import { BusinessException } from '../../src/domain/exceptions/business.exception';

describe('Client Entity', () => {
  it('should create a valid client', () => {
    const client = new Client('John', 'Doe', 'john.doe@example.com');
    expect(client.firstName).toBe('John');
    expect(client.lastName).toBe('Doe');
    expect(client.email).toBe('john.doe@example.com');
  });

  it('should throw BusinessException for short first name', () => {
    expect(() => new Client('J', 'Doe', 'john.doe@example.com')).toThrow(
      BusinessException,
    );
    expect(() => new Client('J', 'Doe', 'john.doe@example.com')).toThrow(
      'Name must be at least 2 characters long',
    );
  });

  it('should throw BusinessException for short last name', () => {
    expect(() => new Client('John', 'D', 'john.doe@example.com')).toThrow(
      BusinessException,
    );
  });

  it('should throw BusinessException for invalid email format', () => {
    expect(() => new Client('John', 'Doe', 'invalid-email')).toThrow(
      BusinessException,
    );
    expect(() => new Client('John', 'Doe', 'invalid-email')).toThrow(
      'Invalid email format',
    );
  });

  it('should update name correctly', () => {
    const client = new Client('John', 'Doe', 'john.doe@example.com');
    client.updateName('Jane', 'Smith');
    expect(client.firstName).toBe('Jane');
    expect(client.lastName).toBe('Smith');
  });

  it('should update email correctly', () => {
    const client = new Client('John', 'Doe', 'john.doe@example.com');
    client.updateEmail('jane.smith@example.com');
    expect(client.email).toBe('jane.smith@example.com');
  });

  it('should default cedula to null', () => {
    const client = new Client('John', 'Doe', 'john.doe@example.com');
    expect(client.cedula).toBeNull();
  });

  it('should allow assigning cedula (write-once enforced at application layer)', () => {
    const client = new Client('John', 'Doe', 'john.doe@example.com');
    client.cedula = '30123456';
    expect(client.cedula).toBe('30123456');
    // La inmutabilidad de cedula se enforce en el DTO/handler/repository,
    // no en el entity. Ver tests del DTO y del repository.
  });
});
