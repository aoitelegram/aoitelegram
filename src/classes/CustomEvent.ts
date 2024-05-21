import fs from "node:fs";
import path from "node:path";
import figlet from "figlet";
import importSync from "import-sync";
import { AoiClient } from "./AoiClient";
import { getObjectKey } from "../utils/";
import { EventEmitter } from "node:events";
import { AoijsTypeError } from "./AoiError";
import type { DataEvent } from "./AoiTyping";
import { ArgsType, AoiFunction } from "./AoiFunction";

class CustomEvent extends EventEmitter {
  public readonly aoitelegram: AoiClient;

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
      throw new AoijsTypeError("You did not specify the 'listen' parameter");
    }

    if (
      options.type === "javascript" &&
      typeof options.callback !== "function"
    ) {
      throw new AoijsTypeError("You did not specify the 'callback' parameter");
    } else if (
      options.type === "aoitelegram" &&
      typeof options.code !== "string"
    ) {
      throw new AoijsTypeError("You did not specify the 'code' parameter");
    }

    if ((options.type === "aoitelegram" || !options.type) && options.code) {
      const eventHandler = async (...args: string[]) => {
        this.aoitelegram.editCustomFunction(
          new AoiFunction()
            .setName("$eventData")
            .setBrackets(true)
            .setFields({
              name: "property",
              type: [ArgsType.String],
              required: false,
            })
            .onCallback(async (context, func) => {
              const options = await func.resolveAllFields(context);
              const result = getObjectKey({ ...args }, options);
              return func.resolve(result);
            }),
        );

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
        throw new AoijsTypeError(
          "The type specified for 'once' is invalid. Only 'false' and 'true' are allowed",
        );
      }
    } else if (options.type === "javascript" && options.callback) {
      if (options.once === true) {
        super.once(options.listen, options.callback);
      } else if (options.once === false || options.once === undefined) {
        super.on(options.listen, options.callback);
      } else {
        throw new AoijsTypeError(
          "The type specified for 'once' is invalid. Only 'false' and 'true' are allowed",
        );
      }
    }

    return this;
  }

  loadEvents(dirPath: string, logger: boolean = true): CustomEvent {
    if (!dirPath) {
      throw new AoijsTypeError("You did not specify the 'dirPath' parameter");
    }

    dirPath = path.join(process.cwd(), dirPath);
    if (!fs.existsSync(dirPath)) {
      throw new AoijsTypeError(
        `The specified file path was not found: ${dirPath}`,
      );
    }

    if (logger) {
      const bigText = figlet.textSync("Custom Event");
      console.log(bigText);
    }

    const items = fs.readdirSync(dirPath, { recursive: true });

    for (const item of items) {
      if (typeof item !== "string" || !item.endsWith(".js")) continue;
      const itemPath = path.join(process.cwd(), item);

      try {
        const requireEvent = require(itemPath);
        const dataEvent = requireEvent.default || requireEvent;
        const dataArr = Array.isArray(dataEvent) ? dataEvent : [dataEvent];

        for (const event of dataArr) {
          this.command(event);
          if (logger) {
            console.log(
              `|---------------------------------------------------------------------|\n`,
              `| Loading in ${itemPath} | Loaded '${event.listen}' | type ${event.type || "aoitelegram"} | custom-event |`,
            );
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    return this;
  }

  addProcessListener(
    eventNames: { [key: string]: boolean },
    eventName: string,
    emitEventName: string,
  ): void {
    const validProcess = {
      exit: "boolean",
      worker: "boolean",
      SIGINT: "boolean",
      message: "boolean",
      warning: "boolean",
      SIGTERM: "boolean",
      beforeExit: "boolean",
      disconnect: "boolean",
      multipleResolves: "boolean",
      rejectionHandled: "boolean",
      uncaughtException: "boolean",
      unhandledRejection: "boolean",
      uncaughtExceptionMonitor: "boolean",
    };
    for (const key in eventNames) {
      if (!(key in validProcess) || typeof eventNames[key] !== "boolean") {
        throw new AoijsTypeError(`Invalid value for process option '${key}'`);
      }
    }
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
