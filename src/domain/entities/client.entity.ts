import { Email } from '../value-objects/email.value-object';
import { Name } from '../value-objects/name.value-object';

export class Client {
  id: number = 0;
  private _firstName: Name;
  private _lastName: Name;
  private _email: Email;
  phone: string = '';
  address: string = '';
  isActive: boolean = true;

  constructor(firstName: string, lastName: string, email: string) {
    this._firstName = new Name(firstName);
    this._lastName = new Name(lastName);
    this._email = new Email(email);
  }

  get firstName(): string {
    return this._firstName.getValue();
  }

  get lastName(): string {
    return this._lastName.getValue();
  }

  get email(): string {
    return this._email.getValue();
  }

  updateName(firstName: string, lastName: string): void {
    this._firstName = new Name(firstName);
    this._lastName = new Name(lastName);
  }

  updateEmail(email: string): void {
    this._email = new Email(email);
  }
}
