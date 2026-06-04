import { UserRole } from '../../domain/enums/user-role.enum';

export class RegisterUserCommand {
  constructor(
    public readonly username: string,
    public readonly name: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly cedula?: string,
    public readonly roles?: UserRole[],
  ) {}
}
