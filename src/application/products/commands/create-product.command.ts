export class CreateProductCommand {
  constructor(
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly taxIds?: number[],
  ) {}
}
