export class UpdateProductCommand {
  constructor(
    public readonly id: number,
    public readonly data: {
      name?: string;
      price?: number;
      stock?: number;
      taxIds?: number[];
    },
  ) {}
}
