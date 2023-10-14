import { CreateStorage } from "database-sempai";

interface DatabaseOptions {
  path?: string;
  table?: string[];
  extname?: string;
}

class AoiManager extends CreateStorage<string, unknown> {
  constructor(options: DatabaseOptions = {}) {
    super(options);
    this.connect();
  }

  async variables(options: { [key: string]: unknown }, table: string = "main") {
    for (const varName in options) {
      const hasVar = await this.has(table, varName);
      if (!hasVar) {
        await this.set(table, varName, options[varName]);
      }
    }
  }
}

export { AoiManager, DatabaseOptions };
