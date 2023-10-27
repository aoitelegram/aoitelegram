import chalk from "chalk";
import { AoijsError } from "./AoiError";
import { CreateStorage } from "database-sempai";

/**
 * Configuration options for the database connection.
 * @interface DatabaseOptions
 */
interface DatabaseOptions {
  /**
   * The file path to the database storage.
   * @type {string}
   */
  path?: string;

  /**
   * An array of table names within the database.
   * @type {string[]}
   */
  table?: string[];

  /**
   * The file extension name used for the database file.
   * @type {string}
   */
  extname?: string;

  /**
   * Log ready database
   * @type {boolean}
   */
  console?: boolean;
}

/**
 * A class that extends CreateStorage and is responsible for managing database operations.
 */
class AoiManager extends CreateStorage<string, unknown> {
  /**
   * Creates a new instance of AoiManager.
   * @param {DatabaseOptions} options - Configuration options for the database connection.
   */
  constructor(options: DatabaseOptions = { console: true }) {
    if (!options.table) {
      options.table = ["main", "vars"];
    } else if (options.table.filter((table) => table !== "vars")) {
      options.table = [...options.table, "vars"];
    }
    super(options);
    if (options.console) {
      this.on("ready", async () => {
        const text = chalk.green("Database has been established");
        console.log(text);
        const allVar = await this.all("vars");
        for (const vars in allVar) {
          await this.delete("vars", vars);
        }
      });
    }
    this.connect();
  }

  /**
   * Set variables in the database.
   * @param {Object} options - Key-value pairs of variables to set.
   * @param {string | string[]} table - The database table to use (optional).
   */
  async variables(
    options: { [key: string]: unknown },
    tables: string | string[] = "main",
  ) {
    if (Array.isArray(tables)) {
      for await (const table of tables) {
        for (const varName in options) {
          const hasVar = await this.has(table, varName);
          if (!hasVar) {
            await this.set(table, varName, options[varName]);
          }
        }
      }
    } else if (typeof tables === "string") {
      for (const varName in options) {
        const hasVar = await this.has(tables, varName);
        if (!hasVar) {
          await this.set(tables, varName, options[varName]);
        }
      }
    } else {
      throw new AoijsError(
        "parameter",
        "the parameter should be of type 'string' or 'string[]'",
      );
    }
  }
}

export { AoiManager, DatabaseOptions };
