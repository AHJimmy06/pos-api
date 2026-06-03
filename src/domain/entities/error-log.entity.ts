export class ErrorLog {
  id?: number;
  message: string;
  stackTrace?: string;
  exceptionType?: string;
  userId?: number;
  path: string;
  source?: string;
  createdAt: Date;

  constructor(params: {
    message: string;
    path: string;
    stackTrace?: string;
    exceptionType?: string;
    userId?: number;
    source?: string;
  }) {
    this.message = params.message;
    this.path = params.path;
    this.stackTrace = params.stackTrace;
    this.exceptionType = params.exceptionType;
    this.userId = params.userId;
    this.source = params.source;
    this.createdAt = new Date();
  }
}
