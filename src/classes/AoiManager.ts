import { Collection } from "telegramsjs";
import { AoiLogger } from "./AoiLogger";
import { AoijsError } from "./AoiError";
import {
  StorageDB,
  MongoDB,
  FirebaseDB,
  type EventDataMap,
  type StorageDBOptions,
  type MongoDBOptions,
  type FirebaseDBOptions,
} from "@aoitelegram/database";

type AoiManagerOptions = { logging: boolean } & (
  | { type: "storage"; options?: StorageDBOptions }
  | { type: "mongo"; url: string; options?: MongoDBOptions }
  | { type: "firebase"; url: string; options?: FirebaseDBOptions }
);

class AoiManager<Value = any> {
  database: StorageDB<Value> | MongoDB<Value> | FirebaseDB<Value>;
  collection: Collection<string, Value> = new Collection();

  constructor(options: AoiManagerOptions = { type: "storage", logging: true }) {
    if (options.type === "storage") {
      this.database = new StorageDB(options.options);
    } else if (options.type === "mongo") {
      this.database = new MongoDB(options.url, options.options);
    } else if (options.type === "firebase") {
      this.database = new FirebaseDB(options.url, options.options);
    } else {
      throw new AoijsError("type", "Invalid database type specified");
    }

    if (options.logging === undefined || options.logging) {
      this.on("ready", async () => {
        AoiLogger.info("Database has been established");
      });
    }
    this.database.connect();
  }

  on<T extends keyof EventDataMap<Value, this["database"]>>(
    eventName: T,
    listener: (args: EventDataMap<Value, this["database"]>[T]) => unknown,
  ) {
    return this.database.on(eventName, listener);
  }

  once<T extends keyof EventDataMap<Value, this["database"]>>(
    eventName: T,
    listener: (args: EventDataMap<Value, this["database"]>[T]) => unknown,
  ) {
    return this.database.once(eventName, listener);
  }

  off<T extends keyof EventDataMap<Value, this["database"]>>(
    eventName: T,
    listener: (args: EventDataMap<Value, this["database"]>[T]) => unknown,
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

  defaulValue(vars: string, table: string) {
    return this.collection.get(`${vars}_${table}`);
  }

  variables(
    options: { [key: string]: unknown },
    tables: string | string[] = this.tables[0],
  ) {
    if (Array.isArray(tables)) {
      for (const table of tables) {
        for (const varName in options) {
          if (!options.hasOwnProperty(varName)) continue;
          const hasVar = this.has(table, varName);
          this.collection.set(`${varName}_${table}`, options[varName]);
          if (!hasVar) {
            this.set(table, varName, options[varName]);
          }
        }
      }
    } else if (typeof tables === "string") {
      for (const varName in options) {
        if (!options.hasOwnProperty(varName)) continue;
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
