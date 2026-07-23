export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  errors?: any;

  private constructor(success: boolean, message: string, data?: T, meta?: any, errors?: any) {
    this.success = success;
    this.message = message;
    if (data !== undefined) this.data = data;
    if (meta !== undefined) this.meta = meta;
    if (errors !== undefined) this.errors = errors;
  }

  static success<T>(message: string, data?: T, meta?: any) {
    return new ApiResponse(true, message, data, meta);
  }

  static failure(message: string, errors?: any) {
    return new ApiResponse(false, message, undefined, undefined, errors);
  }
}
