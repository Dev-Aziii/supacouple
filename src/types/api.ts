export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  status: number;
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
}
