export class BusinessException extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string = 'BUSINESS_ERROR',
  ) {
    super(message);
    this.name = 'BusinessException';
    Object.setPrototypeOf(this, BusinessException.prototype);
  }
}
