export class BffApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "BffApiError";
    this.status = status;
    this.data = data;
  }
}
