export class ApiError extends Error {
  constructor(message: string, private readonly code: number) {
    super(message);
    this.name = "ApiError";
  }
}

export class SDKError extends Error {
  constructor(message: string, private readonly payload?: any) {
    super(`[ORDERLY SDK ERROR]:${message}`);
    this.name = "SDKError";
  }
}
