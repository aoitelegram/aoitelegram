import { promises as fs } from "node:fs";
import path from "node:path";
import figlet from "figlet";
import importSync from "import-sync";
import { AoiClient } from "./AoiClient";
import { DataEvent } from "./AoiTyping";
import { AoijsError } from "./AoiError";
import { EventEmitter } from "node:events";
import { getObjectKey } from "../function/parser";

/**
 * CustomEvent class extends EventEmitter for handling custom events.
 */
class CustomEvent extends EventEmitter {
  #count: number = 1;
  /**
   * AoiClient instance for handling Telegram-specific functionality.
   */
  aoitelegram: AoiClient;

  /**
   * Constructs a new CustomEvent instance.
   * @param aoitelegram - The AoiClient instance for Telegram functionality.
   */
  constructor(aoitelegram: AoiClient) {
    super();
    this.aoitelegram = aoitelegram;
    aoitelegram.customEvent = this;

    process.on("beforeExit", (code) => this.emit("process:beforeExit", code));
    process.on("disconnect", () => this.emit("process:disconnect"));
    process.on("exit", (code) => this.emit("process:exit", code));
    process.on("message", (message, sendHandle) =>
      this.emit("process:message", message, sendHandle),
    );
    process.on("multipleResolves", async (type, promise, value) =>
      this.emit("process:multipleResolves", type, await promise, value),
    );
    process.on("rejectionHandled", async (promise) =>
      this.emit("process:rejectionHandled", await promise),
    );
    process.on("uncaughtException", (err) =>
      this.emit("process:uncaughtException", err),
    );
    process.on("uncaughtExceptionMonitor", (err) =>
      this.emit("process:uncaughtExceptionMonitor", err),
    );
    process.on("unhandledRejection", async (reason, promise) =>
      this.emit("process:unhandledRejection", reason, await promise),
    );
    process.on("warning", (warning) => this.emit("process:warning", warning));
    process.on("worker", (worker) => this.emit("process:worker", worker));
    process.on("SIGINT", () => this.emit("process:SIGINT"));
    process.on("SIGTERM", () => this.emit("process:SIGTERM"));
  }

  /**
   * Registers a custom event listener.
   * @param options - The options for the custom event.
   * @returns Returns the CustomEvent instance for method chaining.
   */
  command(options: DataEvent) {
    if (!options?.listen) {
      throw new AoijsError(
        "CustomEvent",
        `you did not specify the 'listen' parameter`,
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

    if ((options.type === "aoitelegram" || !options.type) && options.code) {
      const eventHandler = async (...args: string[]) => {
        this.aoitelegram.editFunction({
          name: "$eventData",
          callback: (context) => {
            return !context.inside
              ? JSON.stringify({ ...args })
              : context.inside
                ? getObjectKey({ ...args }, context.inside)
                : JSON.stringify({ ...args });
          },
        });

        await this.aoitelegram.evaluateCommand(
          { event: options.listen },
          options.code as string,
          { ...args, telegram: this.aoitelegram },
          options.useNative,
        );
      };

      if (options.once === true) {
        super.once(options.listen, eventHandler);
      } else if (options.once === false || options.once === undefined) {
        super.on(options.listen, eventHandler);
      } else {
        throw new AoijsError(
          "CustomEvent",
          "the type specified for 'once' is invalid. Only 'false' and 'true' are allowed",
        );
      }
    } else if (options.type === "js" && options.callback) {
      if (options.once === true) {
        super.once(options.listen, options.callback);
      } else if (options.once === false || options.once === undefined) {
        super.on(options.listen, options.callback);
      } else {
        throw new AoijsError(
          "CustomEvent",
          "the type specified for 'once' is invalid. Only 'false' and 'true' are allowed",
        );
      }
    }

    return this;
  }

  /**
   * Loads and registers events from a specified directory path.
   * @param dirPath - The path to the directory containing event files.
   * @param log - A flag indicating whether to log loading events (default: true).
   */
  async loadEvents(dirPath: string, log: boolean = true) {
    if (!dirPath) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'dirPath' parameter",
      );
    }

    try {
      await fs.access(dirPath);
    } catch (error) {
      throw new AoijsError(
        "file",
        "the specified file path was not found",
        dirPath,
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

    try {
      const items = await fs.readdir(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);

        if (stats.isDirectory()) {
          await this.loadEvents(itemPath, log);
        } else if (itemPath.endsWith(".js")) {
          const requireEvent = importSync(itemPath);
          const dataEvent = requireEvent.default || requireEvent;
          if (Array.isArray(dataEvent)) {
            dataEvent.forEach((dataEvent) => {
              if (log) {
                console.log(
                  `|---------------------------------------------------------------------|\n`,
                  `| Loading in ${itemPath} | Loaded '${dataEvent.listen}' | type ${dataEvent.type || "aoitelegram"} | custom-event |`,
                );
              }
              this.command(dataEvent);
            });
          } else {
            if (log) {
              console.log(
                `|---------------------------------------------------------------------|\n`,
                `| Loading in ${itemPath} | Loaded '${dataEvent.listen}' | type ${dataEvent.type || "aoitelegram"} | custom-event |`,
              );
            }
            this.command(dataEvent);
          }
        }
      }
      return this;
    } catch (error) {
      console.error("Error loading events:", error);
      return this;
    }
  }

  /**
   * Emits a custom event with the specified name and arguments.
   * @param name - The name of the custom event to emit.
   * @param args - Additional arguments to pass to the event listeners.
   * @returns Returns the CustomEvent instance for method chaining.
   */
  override emit<T>(name: string, ...args: T[]) {
    return super.emit(name, ...args);
  }
}

export { CustomEvent };
