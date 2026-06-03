import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserHandler } from './register-user.handler';
import { RegisterUserCommand } from './register-user.command';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { IUserRepository } from '../common/interfaces/user.repository.interface';
import type { IPasswordService } from '../common/interfaces/password-service.interface';
import { User } from '../../domain/entities/user.entity';

describe('RegisterUserHandler', () => {
  let handler: RegisterUserHandler;
  let mockUserRepository: jest.MockedPartial<IUserRepository>;
  let mockPasswordService: jest.MockedPartial<IPasswordService>;

  beforeEach(async () => {
    mockUserRepository = {
      existsByEmail: jest.fn(),
      existsByUsername: jest.fn(),
      create: jest.fn(),
    };

    mockPasswordService = {
      validateStrength: jest.fn(),
      hash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserHandler,
        { provide: 'IUserRepository', useValue: mockUserRepository },
        { provide: 'IPasswordService', useValue: mockPasswordService },
      ],
    }).compile();

    handler = module.get<RegisterUserHandler>(RegisterUserHandler);
  });

  const validCommand = {
    username: 'testuser',
    name: 'John',
    lastName: 'Doe',
    email: 'test@pos.com',
    password: 'Password1@',
    cedula: '12345678',
  };

  const createMockUser = () =>
    ({
      id: 1,
      username: 'testuser',
      name: 'John',
      lastName: 'Doe',
      email: 'test@pos.com',
      passwordHash: 'hashed',
      cedula: '12345678',
      isActive: true,
      roles: [],
    } as unknown as User);

  // ─── TRIANGULATE: Valid registration ───────────────────────────────────────

  describe('TRIANGULATE: valid registration', () => {
    it('should register a user with valid data and valid password', async () => {
      mockPasswordService.validateStrength!.mockReturnValue({
        valid: true,
        errors: [],
      });
      mockUserRepository.existsByEmail!.mockResolvedValue(false);
      mockUserRepository.existsByUsername!.mockResolvedValue(false);
      mockPasswordService.hash!.mockResolvedValue('hashedpassword');
      mockUserRepository.create!.mockResolvedValue(createMockUser());

      const result = await handler.execute(validCommand);

      expect(mockPasswordService.validateStrength).toHaveBeenCalledWith(
        'Password1@',
      );
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result.username).toBe('testuser');
    });

    it('should accept cedula with V prefix', async () => {
      mockPasswordService.validateStrength!.mockReturnValue({
        valid: true,
        errors: [],
      });
      mockUserRepository.existsByEmail!.mockResolvedValue(false);
      mockUserRepository.existsByUsername!.mockResolvedValue(false);
      mockPasswordService.hash!.mockResolvedValue('hashedpassword');
      mockUserRepository.create!.mockResolvedValue({
        ...createMockUser(),
        cedula: 'V12345678',
      } as unknown as User);

      const command = { ...validCommand, cedula: 'V12345678' };
      const result = await handler.execute(command);

      expect(result.cedula).toBe('V12345678');
    });

    it('should accept cedula without V prefix', async () => {
      mockPasswordService.validateStrength!.mockReturnValue({
        valid: true,
        errors: [],
      });
      mockUserRepository.existsByEmail!.mockResolvedValue(false);
      mockUserRepository.existsByUsername!.mockResolvedValue(false);
      mockPasswordService.hash!.mockResolvedValue('hashedpassword');
      mockUserRepository.create!.mockResolvedValue(createMockUser());

      const command = { ...validCommand, cedula: '1234567890' };
      const result = await handler.execute(command);

      expect(result.cedula).toBe('1234567890');
    });
  });

  // ─── RED: weak password should throw – before handler fix ───────────────────

  describe('PASSWORD STRENGTH ENFORCEMENT', () => {
    it('should reject password without uppercase letter', async () => {
      mockPasswordService.validateStrength!.mockReturnValue({
        valid: false,
        errors: ['Password must contain at least 1 uppercase letter'],
      });

      await expect(
        handler.execute({ ...validCommand, password: 'weakpass1@' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject password without special character', async () => {
      mockPasswordService.validateStrength!.mockReturnValue({
        valid: false,
        errors: [
          'Password must contain at least 1 special character (@$!%*?&)',
        ],
      });

      await expect(
        handler.execute({ ...validCommand, password: 'Weakpassword1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject password shorter than 8 chars', async () => {
      mockPasswordService.validateStrength!.mockReturnValue({
        valid: false,
        errors: ['Password must be 8-10 characters'],
      });

      await expect(
        handler.execute({ ...validCommand, password: 'Ab1@' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject password longer than 10 chars', async () => {
      mockPasswordService.validateStrength!.mockReturnValue({
        valid: false,
        errors: ['Password must be 8-10 characters'],
      });

      await expect(
        handler.execute({ ...validCommand, password: 'Ab1@longpassword' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should collect multiple violations in error message', async () => {
      mockPasswordService.validateStrength!.mockReturnValue({
        valid: false,
        errors: [
          'Password must contain at least 1 uppercase letter',
          'Password must contain at least 1 number',
        ],
      });

      try {
        await handler.execute({ ...validCommand, password: 'weakpwd@' });
        fail('Expected BadRequestException');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        const msg = (e as BadRequestException).message;
        expect(msg).toContain('uppercase');
        expect(msg).toContain('number');
      }
    });
  });
});
