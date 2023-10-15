class AoijsError extends Error {
  description: string;
  command?: string;
  functions?: string;

  constructor(name: string, description: string, command?: string, functions?: string) {
    super(description);

    this.name = `AoijsError[${name}]`;
    this.description = description;
    this.command = command;
    this.functions = functions;
  }
}

export { AoijsError };
