import chalk from "chalk";
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
  constructor(options: DatabaseOptions = {}) {
    super(options);
    if (options.console) {
      this.on("ready", () => {
        const text = chalk.green("Database has been established");
        console.log(text);
      });
    }
    this.connect();
  }

  /**
   * Set variables in the database.
   * @param {Object} options - Key-value pairs of variables to set.
   * @param {string} table - The database table to use (optional).
   */
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
