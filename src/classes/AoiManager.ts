import { AoiLogger } from "./AoiLogger";
import { Collection } from "@telegram.ts/collection";
import { AoijsError, AoijsTypeError } from "./AoiError";
import {
  StorageDB,
  MongoDB,
  FirebaseDB,
  type IEventDataMap,
  type StorageDBOptions,
  type MongoDBOptions,
  type FirebaseDBOptions,
} from "@aoitelegram/database";

type AoiManagerOptions = { logging?: boolean } & (
  | { type: "storage"; options?: StorageDBOptions }
  | { type: "mongo"; url: string; options?: MongoDBOptions }
  | { type: "firebase"; url: string; options?: FirebaseDBOptions }
);

class AoiManager<Value = any> {
  public readonly tables: string[];
  public readonly database!:
    | StorageDB<Value>
    | MongoDB<Value>
    | FirebaseDB<Value>;
  public readonly collection: Collection<string, Value> = new Collection();

  constructor(
    options: AoiManagerOptions = {
      type: "storage",
      logging: true,
      options: {
        path: "database",
        tables: ["main"],
      },
    },
  ) {
    if (typeof options !== "object") {
      throw new AoijsTypeError(
        `The expected type is "object", but received type ${typeof options}`,
      );
    } else this.#validateOptions(options);

    options.options ??= {};
    if (Array.isArray(options.options?.tables)) {
      options.options.tables = [...options.options.tables, "timeout"];
    } else {
      options.options.tables = ["main", "timeout"];
    }
    this.tables = options.options.tables;
    if (options.type === "storage") {
      this.database = new StorageDB(options.options);
    } else if (options.type === "mongo") {
      this.database = new MongoDB(options.url, options.options);
    } else if (options.type === "firebase") {
      this.database = new FirebaseDB(options.url, options.options);
    }

    if (options.logging === undefined || options.logging) {
      this.on("ready", async (ctx) => {
        AoiLogger.info("Database has been established");
      });
    }
  }

  on<T extends keyof IEventDataMap<Value, this["database"]>>(
    eventName: T,
    listener: (args: IEventDataMap<Value, this["database"]>[T]) => void,
  ) {
    return this.database.on(eventName, listener);
  }

  once<T extends keyof IEventDataMap<Value, this["database"]>>(
    eventName: T,
    listener: (args: IEventDataMap<Value, this["database"]>[T]) => void,
  ) {
    return this.database.once(eventName, listener);
  }

  off<T extends keyof IEventDataMap<Value, this["database"]>>(
    eventName: T,
    listener: (args: IEventDataMap<Value, this["database"]>[T]) => void,
  ) {
    return this.database.off(eventName, listener);
  }

  async get(table: string, key: string): Promise<Value | undefined> {
    return await this.database.get(table, key);
  }

  async set(table: string, key: string, value: Value): Promise<this> {
    await this.database.set(table, key, value);
    return this;
  }

  async has(table: string, key: string): Promise<boolean> {
    return await this.database.has(table, key);
  }

  async all(table: string): Promise<{
    [key: string]: Value;
  }> {
    return await this.database.all(table);
  }

  async findOne(
    table: string,
    callback: (
      entry: {
        key: string;
        value: Value;
      },
      index: number,
    ) => boolean | Promise<boolean>,
  ): Promise<{
    key: string;
    value: Value;
    index: number;
  } | null> {
    return await this.database.findOne(table, callback);
  }

  async findMany(
    table: string,
    callback: (
      entry: {
        key: string;
        value: Value;
      },
      index: number,
    ) => boolean | Promise<boolean>,
  ): Promise<
    {
      key: string;
      value: Value;
      index: number;
    }[]
  > {
    return await this.database.findMany(table, callback);
  }

  async deleteMany(
    table: string,
    callback: (
      entry: {
        key: string;
        value: Value;
      },
      index: number,
    ) => boolean | Promise<boolean>,
  ): Promise<void> {
    return await this.database.deleteMany(table, callback);
  }

  async delete(table: string, key: string | string[]): Promise<void> {
    return await this.database.delete(table, key);
  }

  async clear(table: string): Promise<void> {
    return await this.database.clear(table);
  }

  async convertFileToTable(table: string, filePath: string): Promise<void> {
    return await this.database.convertFileToTable(table, filePath);
  }

  async convertTableToFile(table: string, filePath: string): Promise<void> {
    return await this.database.convertTableToFile(table, filePath);
  }

  async ping(): Promise<number> {
    return await this.database.ping();
  }

  async connect(): Promise<void> {
    return await this.database.connect();
  }

  defaulValue(vars: string, table: string): any {
    return this.collection.get(`${vars}_${table}`);
  }

  async variables(
    options: { [key: string]: any },
    tables: string | string[] = this.tables[0],
  ): Promise<void> {
    if (Array.isArray(tables)) {
      for (const table of tables) {
        for (const varName in options) {
          if (!options.hasOwnProperty(varName)) continue;
          const hasVar = await this.has(table, varName);
          this.collection.set(`${varName}_${table}`, options[varName]);
          if (!hasVar) {
            await this.set(table, varName, options[varName]);
          }
        }
      }
    } else if (typeof tables === "string") {
      for (const varName in options) {
        if (!options.hasOwnProperty(varName)) continue;
        const hasVar = await this.has(tables, varName);
        this.collection.set(`${varName}_${tables}`, options[varName]);
        if (!hasVar) {
          await this.set(tables, varName, options[varName]);
        }
      }
    } else {
      throw new AoijsTypeError(
        "The parameter should be of type 'string' or 'string[]'",
      );
    }
  }

  #validateOptions(options: Record<string, any>) {
    if (!options.type) {
      throw new AoijsTypeError(
        "You need to specify the type of database you will be using, available options are storage | mongo | firebase",
      );
    }

    if ("type" in options) {
      if (
        options.type !== "storage" &&
        options.type !== "mongo" &&
        options.type !== "firebase"
      ) {
        throw new AoijsTypeError(
          'Only "storage", "mongo", or "firebase" are valid values for the type property',
        );
      }

      if (
        (options.type === "mongo" || options.type === "firebase") &&
        !("url" in options)
      ) {
        throw new AoijsTypeError(
          'For "mongo" or "firebase" type, a "url" parameter is required',
        );
      }
    }

    if ("logging" in options) {
      if (
        typeof options.logging !== "boolean" &&
        typeof options.logging !== "undefined"
      ) {
        throw new AoijsTypeError(
          "Logging property must be a boolean or undefined",
        );
      }
    }
  }
}

export { AoiManager, AoiManagerOptions };
