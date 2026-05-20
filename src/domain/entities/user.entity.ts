import { UserRole } from '../enums/user-role.enum';
import { Email } from '../value-objects/email.value-object';
import { Name } from '../value-objects/name.value-object';

export class User {
  id: number = 0;
  private _username: string;
  private _name: Name;
  private _lastName: Name;
  private _email: Email;
  private _passwordHash: string;
  cedula: string | null = null;
  isActive: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  roles: UserRole[] = [UserRole.SELLER];

  constructor(
    username: string,
    name: string,
    lastName: string,
    email: string,
    passwordHash: string,
  ) {
    this._username = username;
    this._name = new Name(name);
    this._lastName = new Name(lastName);
    this._email = new Email(email);
    this._passwordHash = passwordHash;
  }

  get username(): string {
    return this._username;
  }

  get name(): string {
    return this._name.getValue();
  }

  get lastName(): string {
    return this._lastName.getValue();
  }

  get email(): string {
    return this._email.getValue();
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  updateName(name: string, lastName: string): void {
    this._name = new Name(name);
    this._lastName = new Name(lastName);
  }

  updateEmail(email: string): void {
    this._email = new Email(email);
  }

  updatePassword(passwordHash: string): void {
    this._passwordHash = passwordHash;
  }

  deactivate(): void {
    this.isActive = false;
  }

  activate(): void {
    this.isActive = true;
  }
}