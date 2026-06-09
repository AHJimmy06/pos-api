export class CreateClientCommand {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone: string,
    public readonly address: string,
    public readonly email: string,
    public readonly cedula: string | null = null,
  ) {}
}
