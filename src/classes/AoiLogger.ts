import { inspect } from "node:util";
import { Temporal, Intl } from "temporal-polyfill";
import chalk, { type ForegroundColor } from "chalk";

class AoiLogger {
  static readonly textColors = {
    debug: chalk.whiteBright.bold,
    error: chalk.red.bold,
    warn: chalk.yellow.bold,
    info: chalk.cyan.bold,
  };

  static readonly dateColors = chalk.green.bold;

  private static log(
    type: keyof (typeof AoiLogger)["textColors"],
    ...args: unknown[]
  ): void {
    const intlDate = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    }).format();
    console.log(
      AoiLogger.dateColors(`[${intlDate}]`),
      AoiLogger.textColors[type](`[${type.toUpperCase()}]`),
      ...args.map((arg) =>
        AoiLogger.textColors[type](
          typeof arg === "string" ? arg : inspect(arg),
        ),
      ),
    );
  }

  static custom(options: {
    time?: boolean;
    title: {
      color: typeof ForegroundColor;
      text: string;
      bold?: boolean;
    };
    args: {
      color: typeof ForegroundColor;
      text: string;
      bold?: boolean;
    }[];
  }): void {
    const { time, title, args = [] } = options;

    const formattedDate = AoiLogger.dateColors(
      `[${new Date().toLocaleDateString("de-DE")} ${new Date().toLocaleTimeString()}]`,
    );
    const formattedTitle = title.bold
      ? chalk[title.color].bold(title.text)
      : chalk[title.color](title.text);

    let formattedArgs = "";
    if (args && args.length > 0) {
      formattedArgs = args
        .map((arg) =>
          arg.bold
            ? chalk[arg.color].bold(arg.text)
            : chalk[arg.color](arg.text),
        )
        .join(" ");
    }

    if (time) {
      console.log(formattedDate, formattedTitle, formattedArgs);
    } else console.log(formattedTitle, formattedArgs);
  }

  static debug(...args: unknown[]): void {
    this.log("debug", ...args);
  }

  static error(...args: unknown[]): void {
    this.log("error", ...args);
  }

  static warn(...args: unknown[]): void {
    this.log("warn", ...args);
  }

  static info(...args: unknown[]): void {
    this.log("info", ...args);
  }
}

export { AoiLogger };
