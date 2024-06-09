import { version } from "../index.js";

interface IOptionsTypeError {
  path?: string;
  name?: string;
  command?: string;
  errorFunction?: string;
  customError?: boolean;
}

class AoijsError extends Error {
  public readonly name: string;
  public readonly version: string;
  public readonly description: string;

  constructor(description: string, name?: string) {
    super(description);

    this.name = name || "AoijsError";
    this.version = version;
    this.description = description;
  }
}

class AoijsTypeError extends TypeError {
  public readonly name: string;
  public readonly path?: string;
  public readonly version: string;
  public readonly command?: string;
  public readonly description: string;
  public readonly expectedType?: string;
  public readonly errorFunction?: string;
  public readonly customError?: boolean;

  constructor(description: string, options?: IOptionsTypeError) {
    super(description);

    this.path = options?.path;
    this.version = version;
    this.name = options?.name || "AoijsTypeError";
    this.command = options?.command;
    this.description = description;
    this.customError = options?.customError;
    this.errorFunction = options?.errorFunction;
  }
}

class RuntimeError extends Error {
  public readonly line: number;
  public readonly code: string;
  public readonly name: string = "RuntimeError";
  public readonly description: string;
  public readonly errorFunction?: string;

  constructor(
    description: string,
    options?: { line?: number; code?: string; errorFunction?: string },
  ) {
    super(description);

    this.line = options?.line || 0;
    this.code = options?.code || "unknown";
    this.description = description;
    this.errorFunction = options?.errorFunction;
  }
}

export { AoijsError, AoijsTypeError, RuntimeError, IOptionsTypeError };
