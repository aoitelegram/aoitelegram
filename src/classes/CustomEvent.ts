import fs from "node:fs";
import path from "node:path";
import figlet from "figlet";
import importSync from "import-sync";
import { getObjectKey } from "../utils/";
import { AoiClient } from "./AoiClient";
import { DataEvent } from "./AoiTyping";
import { AoijsError } from "./AoiError";
import { EventEmitter } from "node:events";

class CustomEvent extends EventEmitter {
  #count: number = 1;
  aoitelegram: AoiClient;

  constructor(
    aoitelegram: AoiClient,
    options: {
      process?: {
        exit?: boolean;
        worker?: boolean;
        SIGINT?: boolean;
        message?: boolean;
        warning?: boolean;
        SIGTERM?: boolean;
        beforeExit?: boolean;
        disconnect?: boolean;
        multipleResolves?: boolean;
        rejectionHandled?: boolean;
        uncaughtException?: boolean;
        unhandledRejection?: boolean;
        uncaughtExceptionMonitor?: boolean;
      };
    } = {},
  ) {
    super();
    this.aoitelegram = aoitelegram;
    aoitelegram.customEvent = this;

    const { process = {} } = options;

    const processListeners: [string, string][] = [
      ["beforeExit", "process:beforeExit"],
      ["disconnect", "process:disconnect"],
      ["exit", "process:exit"],
      ["message", "process:message"],
      ["multipleResolves", "process:multipleResolves"],
      ["rejectionHandled", "process:rejectionHandled"],
      ["uncaughtException", "process:uncaughtException"],
      ["uncaughtExceptionMonitor", "process:uncaughtExceptionMonitor"],
      ["unhandledRejection", "process:unhandledRejection"],
      ["warning", "process:warning"],
      ["worker", "process:worker"],
      ["SIGINT", "process:SIGINT"],
      ["SIGTERM", "process:SIGTERM"],
    ];

    processListeners.forEach(([eventName, emitEventName]) => {
      this.addProcessListener(process, eventName, emitEventName);
    });
  }

  command(options: DataEvent): CustomEvent {
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
        this.aoitelegram.editCustomFunction({
          name: "$eventData",
          brackets: true,
          fields: [
            {
              required: false,
            },
          ],
          callback: async (context, func) => {
            const options = await func.resolveAllFields(context);
            const result = getObjectKey({ ...args }, options);
            return func.resolve(result);
          },
        });

        await this.aoitelegram.evaluateCommand(options, {
          ...args,
          telegram: this.aoitelegram,
        });
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

  loadEvents(dirPath: string, log: boolean = true): CustomEvent {
    if (!dirPath) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'dirPath' parameter",
      );
    }

    if (!fs.existsSync(dirPath)) {
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

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        this.loadEvents(itemPath, log);
      } else if (itemPath.endsWith(".js")) {
        try {
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
        } catch (err) {
          console.error(err);
        }
      }
    }
    return this;
  }

  addProcessListener(
    eventNames: { [key: string]: boolean },
    eventName: string,
    emitEventName: string,
  ): void {
    if (eventNames[eventName]) {
      process.on(eventName, async (...args: any[]) => {
        const parsedPromise = await Promise.all(args);
        this.emit(emitEventName, ...parsedPromise);
      });
    }
  }

  override emit<T>(name: string, ...args: T[]): boolean {
    return super.emit(name, ...args);
  }
}

export { CustomEvent };
