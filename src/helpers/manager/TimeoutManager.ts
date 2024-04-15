import { AoiClient } from "../../classes/AoiClient";
import { AoijsError } from "../../classes/AoiError";
import { Collection } from "@telegram.ts/collection";
import { type Timeout, setTimeout, clearTimeout } from "long-timeout";

interface ValueDatabase {
  id: string;
  milliseconds: number;
  data: object;
  date: number;
}

class TimeoutManager {
  public readonly database: AoiClient["database"];
  public readonly timeouts: Collection<string, Timeout> = new Collection();
  public readonly telegram: AoiClient;

  constructor(telegram: AoiClient) {
    this.telegram = telegram;
    this.database = telegram.database;

    this.database.on("ready", async () => {
      const timeout = await this.database.findMany(
        "timeout",
        async ({ value }) => typeof value === "object",
      );

      for (const { key, value } of timeout) {
        const remainingTime = value.date + value.milliseconds - Date.now();
        const timeoutDataId = `${value.id}_${value.date}`;

        if (remainingTime > 0) {
          const timeoutId = setTimeout(async () => {
            this.telegram.emit("timeout", this.telegram, value);
            await this.removeTimeout(timeoutDataId);
          }, value.milliseconds);
          this.timeouts.set(timeoutDataId, timeoutId);
        } else {
          this.telegram.emit("timeout", this.telegram, value);
          await this.removeTimeout(timeoutDataId);
        }
      }
    });

    this.telegram.on("addTimeout", (context) => {
      if (!context) return;

      const timeoutId = setTimeout(async () => {
        this.telegram.emit("timeout", this.telegram, context);
        await this.database.delete("timeout", `${context.id}_${context.date}`);
      }, context.milliseconds);

      this.timeouts.set(`${context.id}_${context.date}`, timeoutId);
    });
  }

  async addTimeout(
    id: string,
    options: {
      milliseconds: number;
      data: object;
    },
  ): Promise<string> {
    const data = {
      ...options,
      id,
      date: Date.now(),
    };
    this.telegram.emit("addTimeout", data);
    await this.database.set("timeout", `${id}_${data.date}`, data);
    return `${id}_${data.date}`;
  }

  async removeTimeout(timeout: string): Promise<boolean> {
    const timeoutId = this.timeouts.get(timeout);
    if (!timeoutId) return false;

    clearTimeout(timeoutId);
    this.timeouts.delete(timeout);
    await this.database.delete("timeout", timeout);
    return true;
  }
}

export { TimeoutManager, ValueDatabase };
