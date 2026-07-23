import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

export class ApiError extends Error {
  public status?: number;
  public data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class ApiClient {
  public client: AxiosInstance;
  private currentAccessToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

  constructor(config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL: '/api',
      withCredentials: true,
      timeout: 10000, // 10s default timeout
      ...config,
    });

    this.setupInterceptors();
  }

  public setAccessToken(token: string | null) {
    this.currentAccessToken = token;
  }

  private processQueue(error: AxiosError | null, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      if (this.currentAccessToken) {
        config.headers.Authorization = `Bearer ${this.currentAccessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (originalRequest?.url === '/auth/refresh-token') {
          return Promise.reject(this.formatError(error));
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.client(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshResponse: any = await this.client.post('/auth/refresh-token');
            const newToken = refreshResponse.data?.accessToken;
            
            if (newToken) {
              this.setAccessToken(newToken);
            }
            
            this.processQueue(null, newToken);
            return this.client(originalRequest);
          } catch (err: any) {
            this.processQueue(err, null);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:session-expired'));
            }
            return Promise.reject(this.formatError(err));
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: AxiosError): ApiError {
    const status = error.response?.status;
    const responseData: any = error.response?.data;
    const message = responseData?.message || error.message || 'An unexpected error occurred';
    return new ApiError(message, status, responseData);
  }

  // Base methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
