export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
