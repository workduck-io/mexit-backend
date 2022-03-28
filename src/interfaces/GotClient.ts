export interface GotResponse {
  data: unknown;
  status: number;
}

export interface GotClientType {
  post<T>(url: string, payload: T, authToken: string): Promise<GotResponse>;
  delete(url: string, authToken: string): Promise<GotResponse>;
  put<T>(url: string, payload: T, authToken: string): Promise<GotResponse>;
  get(url: string, authToken: string): Promise<GotResponse>;
}
