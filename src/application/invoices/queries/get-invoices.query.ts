export class GetInvoicesQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly searchId?: number,
    public readonly userId?: number,
  ) {}
}
