export class UpdateUserCommand {
  constructor(
    public readonly id: number,
    public readonly username?: string,
    public readonly name?: string,
    public readonly lastName?: string,
    public readonly email?: string,
    public readonly cedula?: string,
    public readonly isActive?: boolean,
  ) {}
}
