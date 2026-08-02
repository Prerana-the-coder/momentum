export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, string[] | undefined>;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(path, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    const message =
      payload.success === false ? payload.error.message : "Request failed";
    const code = payload.success === false ? payload.error.code : undefined;
    throw new ApiClientError(message, response.status, code);
  }

  return payload.data;
}

export type HealthStatus = {
  service: string;
  status: string;
  timestamp: string;
  database: string;
};

export function fetchHealth() {
  return apiRequest<HealthStatus>("/api/health");
}
