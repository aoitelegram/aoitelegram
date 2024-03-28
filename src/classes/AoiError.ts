class AoijsError extends Error {
  name: string;
  description: string;
  command?: unknown;
  functions?: string;

  constructor(
    name: string | undefined,
    description: string,
    command?: unknown,
    functions?: string,
  ) {
    super(description);

    this.name = name ? `AoijsError[${name}]` : `AoijsError`;
    this.description = description;
    this.command = command;
    this.functions = functions;
  }
}

class AoijsTypeError extends TypeError {
  constructor(description: string, name?: string) {
    super(description);
    this.name = name ? `AoijsTypeError[${name}]` : "AoijsTypeError";
  }
}

export { AoijsError, AoijsTypeError };
