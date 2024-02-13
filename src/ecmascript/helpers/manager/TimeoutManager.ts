import { setTimeout } from "node:timers";
import { Collection } from "telegramsjs";
import { AoijsError } from "../../classes/AoiError.js";
import { AoiClient } from "../../classes/AoiClient.js";

interface ValueDatabase {
  id: string;
  milliseconds: number;
  data: object;
  date: number;
}

/**
 * A class responsible for managing timeouts and associated actions.
 */
class TimeoutManager {
  database: AoiClient["database"];
  /**
   * The collection of registered timeouts.
   */
  timeouts: Collection<string, NodeJS.Timeout> = new Collection();
  /**
   * A reference to the AoiClient instance.
   */
  telegram: AoiClient;

  /**
   * Constructs a new TimeoutManager instance.
   * @param telegram The AoiClient instance.
   */
  constructor(telegram: AoiClient) {
    this.telegram = telegram;
    this.database = telegram.database;
    /**
     * Handles the 'ready' event, which is emitted when the database connection is established.
     */
    this.database.on("ready", () => {
      this.database.forEach("timeout", async (value, key) => {
        const timeoutData = (await this.database.get(
          "timeout",
          key,
        )) as ValueDatabase;

        if (!timeoutData) return;

        const remainingTime =
          timeoutData.date + timeoutData.milliseconds - Date.now();

        if (remainingTime > 0) {
          const timeoutId = setTimeout(async () => {
            this.telegram.emit("timeout", this.telegram, timeoutData);
            await this.removeTimeout(timeoutData.id);
          }, timeoutData.milliseconds);
          this.timeouts.set(timeoutData.id, timeoutId);
        } else {
          this.telegram.emit("timeout", this.telegram, timeoutData);
          await this.removeTimeout(timeoutData.id);
        }
      });
    });

    /**
     * Handles the 'addTimeout' event, which is emitted when a new timeout is scheduled.
     * @param context The context object containing timeout details.
     */
    this.telegram.on("addTimeout", (context) => {
      if (!context) return;
      if (context.milliseconds <= 5000) {
        throw new AoijsError(
          "timeout",
          `the specified time should be greater than 5000 milliseconds. Timeout ID: ${context.id}`,
        );
      }

      const timeoutId = setTimeout(async () => {
        this.telegram.emit("timeout", this.telegram, context);
        await this.database.delete("timeout", context.id);
      }, context.milliseconds);

      this.timeouts.set(context.id, timeoutId);
    });
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
    this.telegram.emit("addTimeout", data);
    await this.database.set("timeout", id, data);
  }

  /**
   * Asynchronously removes a timeout by its identifier.
   * @param timeout - The identifier of the timeout to be removed.
   * @returns A promise that resolves to true if the timeout was successfully removed, otherwise false.
   */
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
