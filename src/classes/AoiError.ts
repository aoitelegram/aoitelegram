import { version } from "../index.js";

interface IOptionsTypeError {
  path?: string;
  name?: string;
  command?: string;
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

  constructor(description: string, options?: IOptionsTypeError) {
    super(description);

    this.path = options?.path;
    this.version = version;
    this.name = options?.name || "AoijsTypeError";
    this.command = options?.command;
    this.description = description;
  }
}

class RuntimeError extends Error {
  public readonly line: number;
  public readonly code: string;
  public readonly name: string = "RuntimeError";
  public readonly description: string;

  constructor(description: string, line?: number, code?: string) {
    super(description);

    this.line = line || 0;
    this.code = code || "unknown";
    this.description = description;
  }
}

export { AoijsError, AoijsTypeError, RuntimeError, IOptionsTypeError };
