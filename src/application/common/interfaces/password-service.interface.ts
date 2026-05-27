export interface IPasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
  validateStrength(password: string): {
    valid: boolean;
    errors: string[];
  };
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}
