export class CreateTaxCommand {
  constructor(
    public readonly name: string,
    public readonly currentRate: number,
  ) {}
}
