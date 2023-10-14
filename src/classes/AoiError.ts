class AoijsError extends Error {
  description: string;
  command?: string;
  functions?: string;

  constructor(description: string, command?: string, functions?: string) {
    super(description);

    this.name = `AoijsError[null]`;
    this.description = description;
    this.command = command;
    this.functions = functions;
  }
}

export { AoijsError };
