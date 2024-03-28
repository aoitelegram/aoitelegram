import { type Timeout, setTimeout, clearTimeout } from "long-timeout";
import { Collection } from "telegramsjs";
import { AoijsError } from "../../classes/AoiError";
import { AoiClient } from "../../classes/AoiClient";

interface ValueDatabase {
  id: string;
  milliseconds: number;
  data: object;
  date: number;
}

class TimeoutManager {
  database: AoiClient["database"];
  timeouts: Collection<string, Timeout> = new Collection();
  telegram: AoiClient;

  constructor(telegram: AoiClient) {
    this.telegram = telegram;
    this.database = telegram.database;

    this.database.on("ready", () => {
      this.database?.forEach?.("timeout", async (value, key) => {
        const timeoutData = (await this.database.get(
          "timeout",
          key,
        )) as ValueDatabase;

        if (!timeoutData) return;

        const remainingTime =
          timeoutData.date + timeoutData.milliseconds - Date.now();
        const timeoutDataId = `${timeoutData.id}_${timeoutData.date}`;

        if (remainingTime > 0) {
          const timeoutId = setTimeout(async () => {
            this.telegram.emit("timeout", this.telegram, timeoutData);
            await this.removeTimeout(timeoutDataId);
          }, timeoutData.milliseconds);
          this.timeouts.set(timeoutDataId, timeoutId);
        } else {
          this.telegram.emit("timeout", this.telegram, timeoutData);
          await this.removeTimeout(timeoutDataId);
        }
      });
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
  ) {
    const data = {
      ...options,
      id,
      date: Date.now(),
    };
    this.telegram.emit("addTimeout", data);
    await this.database.set("timeout", `${id}_${data.date}`, data);
    return `${id}_${data.date}`;
  }

  async removeTimeout(timeout: string) {
    const timeoutId = this.timeouts.get(timeout);
    if (!timeoutId) return false;

    clearTimeout(timeoutId);
    this.timeouts.delete(timeout);
    await this.database.delete("timeout", timeout);
    return true;
  }
}

export { TimeoutManager, ValueDatabase };
