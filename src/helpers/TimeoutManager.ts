import { setTimeout } from "node:timers";
import { EventEmitter } from "node:events";
import { CreateStorage } from "database-sempai";
import { AoijsError } from "../classes/AoiError";
import { AoiClient } from "../classes/AoiClient";

interface ValueDatabase {
  id: string;
  milliseconds: number;
  data: object;
  date: number;
}

/**
 * A class responsible for managing timeouts and associated actions.
 */
class TimeoutManager extends CreateStorage<string, ValueDatabase> {
  /**
   * The AoiClient instance.
   */
  private telegram: AoiClient;

  /**
   * Constructs a new TimeoutManager instance.
   * @param telegram The AoiClient instance.
   */
  constructor(telegram: AoiClient) {
    super({ table: ["timeout"] });
    this.telegram = telegram;

    /**
     * Handles the 'ready' event, which is emitted when the database connection is established.
     */
    this.on("ready", async () => {
      this.forEach("timeout", async (value, key) => {
        const timeoutData = await this.get("timeout", key);

        if (!timeoutData) return;

        const remainingTime =
          timeoutData.date + timeoutData.milliseconds - Date.now();

        if (remainingTime > 0) {
          setTimeout(async () => {
            this.telegram.emit("timeout", this.telegram, timeoutData);
            await this.delete("timeout", timeoutData.id);
          }, timeoutData.milliseconds);
        } else {
          this.telegram.emit("timeout", this.telegram, timeoutData);
          await this.delete("timeout", timeoutData.id);
        }
      });
    });

    /**
     * Handles the 'addTimeout' event, which is emitted when a new timeout is scheduled.
     * @param context The context object containing timeout details.
     */
    // @ts-ignore
    this.on("addTimeout", (context: ValueDatabase) => {
      if (!context) return;
      if (context.milliseconds <= 5000) {
        throw new AoijsError(
          "timeout",
          `The specified time should be greater than 5000 milliseconds. Timeout ID: ${context.id}`,
        );
      }

      setTimeout(async () => {
        this.telegram.emit("timeout", this.telegram, context);
        await this.delete("timeout", context.id);
      }, context.milliseconds);
    });

    this.connect();
  }

  /**
   * Adds a new timeout with the specified ID, milliseconds, and data.
   * @param id The unique identifier of the timeout.
   * @param options The options for the timeout, including milliseconds and data.
   */
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

    this.emit("addTimeout", data);
    await this.set("timeout", id, data);
  }
}

export { TimeoutManager, ValueDatabase };
