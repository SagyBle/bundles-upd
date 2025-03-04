export class ApiResponse<T = any> {
  ok: boolean;
  message: string;
  data?: T;
  errors?: string[];

  constructor(ok: boolean, message: string, data?: T, errors?: string[]) {
    this.ok = ok;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }

  // ✅ Static method for a successful response
  static success<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data);
  }

  // ✅ Static method for an error response
  static error(message: string, errors?: string[]): ApiResponse<null> {
    return new ApiResponse<null>(false, message, undefined, errors);
  }
}
