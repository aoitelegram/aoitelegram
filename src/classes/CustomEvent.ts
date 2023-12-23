import fs from "node:fs";
import path from "node:path";
import figlet from "figlet";
import { AoiClient } from "./AoiClient";
import { DataEvent } from "./AoiTyping";
import { AoijsError } from "./AoiError";
import { EventEmitter } from "node:events";
import { getObjectKey } from "../function/parser";

/**
 * CustomEvent class extends EventEmitter for handling custom events.
 */
class CustomEvent {
  #count: number = 1;
  eventEmitter: EventEmitter = new EventEmitter();
  /**
   * AoiClient instance for handling Telegram-specific functionality.
   */
  aoitelegram: AoiClient;

  /**
   * Constructs a new CustomEvent instance.
   * @param {AoiClient} aoitelegram - The AoiClient instance for Telegram functionality.
   */
  constructor(aoitelegram: AoiClient) {
    this.aoitelegram = aoitelegram;
    aoitelegram.customEvent = this;
  }

  /**
   * Registers a custom event listener.
   * @param {DataEvent} options - The options for the custom event.
   * @throws {AoijsError} Throws an error if required parameters are not specified.
   * @returns {CustomEvent} Returns the CustomEvent instance for method chaining.
   */
  on(options: DataEvent) {
    if (!options?.listen) {
      throw new AoijsError(
        "CustomEvent",
        "you did not specify the 'listen' parameter",
      );
    }
    if (!options.type) {
      throw new AoijsError(
        "CustomEvent",
        "you did not specify the 'type' parameter",
      );
    }
    if (options.type === "js" && typeof options.callback !== "function") {
      throw new AoijsError(
        "CustomEvent",
        "you did not specify the 'callback' parameter",
      );
    } else if (
      options.type === "aoitelegram" &&
      typeof options.code !== "string"
    ) {
      throw new AoijsError(
        "CustomEvent",
        "you did not specify the 'code' parameter",
      );
    }
    if (options.type === "aoitelegram" && options.code) {
      this.eventEmitter.on(options.listen, async (...args) => {
        this.aoitelegram.addFunction({
          name: "$eventData",
          callback: async (ctx) => {
            const [path] = await ctx.getEvaluateArgs();
            if (!path) return { ...args };
            return path ? { ...args }[path as string] : { ...args };
          },
        });
        await this.aoitelegram.evaluateCommand(
          {
            event: options.listen,
          },
          options.code as string,
          { ...args, telegram: this.aoitelegram },
        );
        this.aoitelegram.removeFunction("$eventData");
      });
    }
    if (options.type === "js" && options.callback) {
      this.eventEmitter.on(options.listen, options.callback);
    }
    return this;
  }

  /**
   * Loads and registers events from a specified directory path.
   * @param {string} dirPath - The path to the directory containing event files.
   * @param {boolean} [log=true] - A flag indicating whether to log loading events (default: true).
   */
  loadEvents(dirPath: string, log: boolean = true) {
    if (!dirPath) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'dirPath' parameter",
      );
    }
    if (this.#count === 1) {
      dirPath = path.join(process.cwd(), dirPath);
      if (log) {
        const bigText = figlet.textSync("Custom Event");
        console.log(bigText);
      }
      this.#count = 0;
    }
    if (!fs.existsSync(dirPath)) {
      throw new AoijsError(
        "file",
        "the specified file path was not found",
        dirPath,
      );
    }

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        this.loadEvents(itemPath, log);
      } else if (itemPath.endsWith(".js")) {
        const requireEvent = require(itemPath);
        const dataEvent = requireEvent.default || requireEvent;
        if (Array.isArray(dataEvent)) {
          dataEvent.forEach((dataEvent) => {
            if (log) {
              console.log(
                `|---------------------------------------------------------------------|\n`,
                `| Loading in ${itemPath} | Loaded '${dataEvent.listen}' | type ${dataEvent.type} | custom-event |`,
              );
            }
            this.on(dataEvent);
          });
        } else {
          if (log) {
            console.log(
              `|---------------------------------------------------------------------|\n`,
              `| Loading in ${itemPath} | Loaded '${dataEvent.listen}' | type ${dataEvent.type} | custom-event |`,
            );
          }
          this.on(dataEvent);
        }
      }
      return this;
    }
  }

  /**
   * Emits a custom event with the specified name and arguments.
   * @param {string} name - The name of the custom event to emit.
   * @param {...any} args - Additional arguments to pass to the event listeners.
   * @returns {CustomEvent} Returns the CustomEvent instance for method chaining.
   */
  emit(name: string, ...args: any) {
    this.eventEmitter.emit(name, ...args);
    return this;
  }
}

export { CustomEvent };
