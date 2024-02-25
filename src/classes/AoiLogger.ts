import { inspect } from "node:util";
import chalk, { type ForegroundColor } from "chalk";

/**
 * AoiLogger class provides logging functionalities with customizable text and date colors.
 * @example
 * const logger = new AoiLogger();
 * logger.debug("Debug message"); // Logs a debug message
 * logger.error("Error message"); // Logs an error message
 * logger.warn("Warning message"); // Logs a warning message
 * logger.info("Info message"); // Logs an info message
 * AoiLogger.custom({
 *   time: true,
 *   title: { color: "blue", text: "Custom Log", bold: true },
 *   args: [
 *     { color: "red", text: "Error:" },
 *     { color: "yellow", text: "Warning:" },
 *     { color: "green", text: "Info:" }
 *   ]
 * }); // Logs a custom message with specified colors and options
 */
class AoiLogger {
  /**
   * Defines text colors for different log types.
   */
  static readonly textColors = {
    debug: chalk.whiteBright.bold,
    error: chalk.red.bold,
    warn: chalk.yellow.bold,
    info: chalk.cyan.bold,
  };

  /**
   * Defines date color for log timestamps.
   */
  static readonly dateColors = chalk.green.bold;

  /**
   * Logs a message with specified type and arguments.
   * @param type - Type of log message (debug, error, warn, info).
   * @param args - Arguments to log.
   */
  private static log(
    type: keyof (typeof AoiLogger)["textColors"],
    ...args: unknown[]
  ) {
    console.log(
      AoiLogger.dateColors(
        `[${new Date().toLocaleDateString("de-DE")} ${new Date().toLocaleTimeString()}]`,
      ),
      AoiLogger.textColors[type](`[${type.toUpperCase()}]`),
      ...args.map((arg) =>
        AoiLogger.textColors[type](
          typeof arg === "string" ? arg : inspect(arg),
        ),
      ),
    );
  }

  /**
   * Logs a custom message with specified options.
   * @param options - Custom log options.
   */
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
  }) {
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

    if (time) console.log(formattedDate, formattedTitle, formattedArgs);
    else console.log(formattedTitle, formattedArgs);
  }

  /**
   * Logs a debug message.
   * @param args - Arguments to log.
   */
  static debug(...args: unknown[]) {
    this.log("debug", ...args);
  }

  /**
   * Logs an error message.
   * @param args - Arguments to log.
   */
  static error(...args: unknown[]) {
    this.log("error", ...args);
  }

  /**
   * Logs a warning message.
   * @param args - Arguments to log.
   */
  static warn(...args: unknown[]) {
    this.log("warn", ...args);
  }

  /**
   * Logs an info message.
   * @param args - Arguments to log.
   */
  static info(...args: unknown[]) {
    this.log("info", ...args);
  }
}

export { AoiLogger };
