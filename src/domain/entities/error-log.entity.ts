export class ErrorLog {
  id?: number;
  message: string;
  stackTrace?: string;
  exceptionType?: string;
  userId?: number;
  path: string;
  createdAt: Date;

  constructor(params: {
    message: string;
    path: string;
    stackTrace?: string;
    exceptionType?: string;
    userId?: number;
  }) {
    this.message = params.message;
    this.path = params.path;
    this.stackTrace = params.stackTrace;
    this.exceptionType = params.exceptionType;
    this.userId = params.userId;
    this.createdAt = new Date();
  }
}
