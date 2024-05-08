import { unInspect } from "./Helpers";
import type { ArgsType } from "@structures/AoiFunction";

function isInteger(content: string): boolean {
  let isBigInt: boolean = false;
  try {
    BigInt(content);
    isBigInt = true;
  } catch (err) {
    isBigInt = false;
  }
  return Number.isInteger(Number(content)) && !isBoolean(content) && isBigInt;
}

function isFloat(content: string): boolean {
  if (!content.includes(".")) return false;
  if (!Number.isNaN(parseFloat(content))) return true;
  else return false;
}

function isBoolean(content: string): boolean {
  if (content === "true") return true;
  else if (content === "false") return true;
  else return false;
}

function isObject(content: string): boolean {
  if (content.startsWith("{") && content.endsWith("}")) {
    try {
      return !!JSON.parse(content);
    } catch (err) {
      try {
        return !!JSON.parse(JSON.stringify(content));
      } catch (err) {
        return false;
      }
    }
  }
  return false;
}

function isArray(content: string): boolean {
  if (content.startsWith("[") && content.endsWith("]")) {
    return true;
  }
  return false;
}

function isNumber(content: string): boolean {
  return isFloat(content) || isInteger(content);
}

function toParse(
  character?: string,
): "string" | "unknown" | "object" | "boolean" | "number" | "array" {
  if (!character) return "unknown";
  switch (true) {
    case isNumber(character):
      return "number";
    case isObject(character):
      return "object";
    case isArray(character):
      return "array";
    case isBoolean(character):
      return "boolean";
    default:
      return "string";
  }
}

function toConvertParse(character?: string): any {
  if (!character) return undefined;
  switch (true) {
    case isNumber(character):
      return Number(character);
    case isObject(character):
      return unInspect(character);
    case isArray(character):
      return unInspect(character);
    case isBoolean(character):
      return character === "true";
    default:
      return character;
  }
}

function formatTime(milliseconds: number): {
  units: {
    years: number;
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    ms: number;
    fullTime: () => string;
  };
} {
  const calculateUnit = (unitInMilliseconds: number): number => {
    const result = Math.trunc(Math.abs(milliseconds) / unitInMilliseconds);
    milliseconds -= result * unitInMilliseconds;
    return result;
  };

  const timeData = {
    units: {
      years: calculateUnit(31536000000),
      months: calculateUnit(2628746000),
      weeks: calculateUnit(604800000),
      days: calculateUnit(86400000),
      hours: calculateUnit(3600000),
      minutes: calculateUnit(60000),
      seconds: calculateUnit(1000),
      ms: calculateUnit(1),
      fullTime: function (): string {
        const timeString = Object.entries(timeData.units)
          .slice(0, -1)
          .map(([unit, value]) => {
            if (unit === "fullTime") return "";
            if (value) {
              const abbreviation = ["months", "ms"].includes(unit)
                ? unit.slice(0, 3)
                : unit.slice(0, 1);
              return `${value}${abbreviation}`;
            }
            return "";
          })
          .filter(Boolean);

        return timeString.join(" ");
      },
    },
  };
  return timeData;
}

function replaceData(
  date: {
    years: number;
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    ms: number;
    fullTime: () => string;
  },
  text: string,
): string {
  Object.entries(date).map((unit) => {
    const regexp = new RegExp(`%${unit[0]}%`, "g");
    text = text.replace(
      regexp,
      typeof unit[1] === "function" ? unit[1]() : `${unit[1]}`,
    );
  });
  return text;
}

export { toParse, toConvertParse, formatTime, replaceData };
