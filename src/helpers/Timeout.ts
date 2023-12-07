const parseStringJSON = require("parsejson");
import { AoiClient } from "../classes/AoiClient";
import { ValueDatabase } from "./manager/TimeoutManager";

interface TimeoutDescription {
  id: string;
  code: string;
}

interface Data {
  [key: string]: any;
}

function getObjectKey<T extends Data, K extends keyof T>(
  data: T,
  path: string,
): T[K] {
  const properties = path.split(".");
  function getProperty(obj: Data, props: string[]): any {
    const [currentProp, ...rest] = props;
    if (obj && obj[currentProp]) {
      if (rest.length > 0) {
        return getProperty(obj[currentProp], rest);
      } else {
        return obj[currentProp];
      }
    }
    return undefined;
  }
  return getProperty(data, properties) as T[K];
}

function parseJSON(objStr: string | object) {
  if (!objStr) return {};
  if (typeof objStr === "object") return objStr;
  if (typeof objStr === "string") {
    return parseStringJSON(objStr) || JSON.parse(objStr);
  }
}

/**
 * A class that manages timeouts and associated actions.
 */
class Timeout {
  /**
   * The array of registered timeouts.
   */
  private timeouts: TimeoutDescription[] = [];

  /**
   * The AoiClient instance.
   */
  private telegram: AoiClient;

  /**
   * Constructs a new Timeout instance.
   * @param telegram The AoiClient instance.
   */
  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  /**
   * Registers a timeout with the specified ID and code.
   * @param timeout The timeout description.
   * @returns The Timeout instance for chaining.
   */
  register(timeout: TimeoutDescription): Timeout {
    const existingIndex = this.timeouts.findIndex(
      (map) => map.id === timeout.id,
    );
    if (existingIndex !== -1) {
      this.timeouts[existingIndex] = timeout;
    } else {
      this.timeouts.push(timeout);
    }

    return this;
  }

  /**
   * Sets up the event handler for timeouts.
   */
  handler() {
    this.telegram.on("timeout", async (timeoutData, context) => {
      for (const timeout of this.timeouts) {
        if (timeout.id !== context.id) continue;

        const timeoutDataParsed = parseJSON(context.data) as Data;

        this.telegram.addFunction({
          name: "$timeoutData",
          callback: async (ctx) => {
            const args = await ctx.getEvaluateArgs();
            return (
              getObjectKey(timeoutDataParsed, args[0] ?? "") ??
              timeoutDataParsed
            );
          },
        });

        await this.telegram.evaluateCommand(
          { event: "timeout" },
          timeout.code,
          timeoutData,
        );

        this.telegram.removeFunction("$timeoutData");
        break;
      }
    });
  }
}

export { Timeout, getObjectKey, parseJSON, TimeoutDescription };
