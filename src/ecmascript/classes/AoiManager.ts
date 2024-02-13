import chalk from "chalk";
import { Collection } from "telegramsjs";
import { AoijsError } from "./AoiError.js";
import { KeyValue } from "@aoitelegram/database";

/**
 * Configuration options for the database connection.
 */
interface KeyValueOptions {
  /**
   * The file path to the database storage.
   */
  path?: string;

  /**
   * An array of table names within the database.
   */
  tables?: string[];

  /**
   * The file extension name used for the database file.
   */
  extname?: string;

  /**
   * Log ready database
   */
  logging?: boolean;
}

/**
 * A class that extends KeyValue and is responsible for managing database operations.
 */
class AoiManager extends KeyValue<string, unknown> {
  collection: Collection<string, unknown> = new Collection();
  /**
   * Creates a new instance of AoiManager.
   * @param options - Configuration options for the database connection.
   */
  constructor(options: KeyValueOptions = {}) {
    super({ ...options, tables: [...(options.tables || []), "timeout"] });
    if (options.logging === true || options.logging === undefined) {
      this.on("ready", async () => {
        const text = chalk.green("Database has been established");
        console.log(text);
      });
    }
    this.connect();
  }

  /**
   * Retrieves the default value for a specific variable from a given table.
   * @param vars - The variable name.
   * @param table - The table name where the variable is stored.
   */
  defaultValue(vars: string, table: string) {
    return this.collection.get(`${vars}_${table}`);
  }

  /**
   * Set variables in the database.
   * @param options - Key-value pairs of variables to set.
   * @param tables - The database table to use.
   */
  variables(
    options: { [key: string]: unknown },
    tables: string | string[] = this.tables[0],
  ) {
    if (Array.isArray(tables)) {
      for (const table of tables) {
        for (const varName in options) {
          const hasVar = this.has(table, varName);
          this.collection.set(`${varName}_${table}`, options[varName]);
          if (!hasVar) {
            this.set(table, varName, options[varName]);
          }
        }
      }
    } else if (typeof tables === "string") {
      for (const varName in options) {
        const hasVar = this.has(tables, varName);
        this.collection.set(`${varName}_${tables}`, options[varName]);
        if (!hasVar) {
          this.set(tables, varName, options[varName]);
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

export { AoiManager, KeyValueOptions };
