import fetch from "node-fetch";
import { unInspect } from "./Helpers";
import type { ArgsType } from "@structures/AoiFunction";
import type { AoiClient } from "@structures/AoiClient";

function isInteger(content: string): boolean {
  return (
    !isNaN(Number(content)) &&
    !isBoolean(content) &&
    content === content.trim() &&
    /^\d+$/.test(content)
  );
}

function isFloat(content: string): boolean {
  return !isNaN(parseFloat(content)) && content.includes(".");
}

function isBoolean(content: string): boolean {
  return content === "true" || content === "false";
}

function isObject(content: string): boolean {
  if (content.startsWith("{") && content.endsWith("}")) {
    const result = unInspect(content);
    return typeof result === "object" && !Array.isArray(result);
  }
  return false;
}

function isArray(content: string): boolean {
  try {
    return Array.isArray(unInspect(content));
  } catch {
    return false;
  }
}

function isNumber(content: string): boolean {
  return isInteger(content) || isFloat(content);
}

async function isChat(chatId: string, telegram: AoiClient): Promise<boolean> {
  try {
    const { id } = await telegram.getChat(chatId);
    return typeof id === "number";
  } catch {
    return false;
  }
}

async function isUrl(content: string): Promise<boolean> {
  try {
    const { statusText } = await fetch(content);
    return statusText === "OK";
  } catch {
    return false;
  }
}

function isTime(content: string): boolean {
  return Boolean(parseTime(content).ms);
}

async function toParse(
  character: string,
  convertAny: boolean,
  telegram: AoiClient,
): Promise<
  | "string"
  | "unknown"
  | "object"
  | "boolean"
  | "number"
  | "array"
  | "chat"
  | "time"
  | "url"
> {
  if (!character) return "unknown";

  if (isNumber(character)) {
    if (!convertAny && (await isChat(character, telegram))) return "chat";
    return "number";
  }

  if (!convertAny && character.includes("http") && (await isUrl(character)))
    return "url";
  if (!convertAny && isTime(character)) return "time";
  if (isObject(character)) return "object";
  if (isArray(character)) return "array";
  if (isBoolean(character)) return "boolean";

  return "string";
}

function toConvertParse(
  character: string,
  type: ArgsType | Awaited<ReturnType<typeof toParse>>,
): any {
  if (!character || type === "unknown") return undefined;

  switch (type) {
    case "time":
      const time = parseTime(character);
      return { ...time, ...formatTime(time.ms) };
    case "chat":
    case "url":
      return character;
    case "number":
      return Number(character);
    case "object":
    case "array":
      return unInspect(character);
    case "boolean":
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
  const units = [
    { name: "years", ms: 31536000000 },
    { name: "months", ms: 2628002880 },
    { name: "weeks", ms: 604800000 },
    { name: "days", ms: 86400000 },
    { name: "hours", ms: 3600000 },
    { name: "minutes", ms: 60000 },
    { name: "seconds", ms: 1000 },
    { name: "ms", ms: 1 },
  ];

  const result: Record<string, number> = {};
  units.forEach((unit) => {
    result[unit.name] = Math.trunc(milliseconds / unit.ms);
    milliseconds %= unit.ms;
  });

  return {
    units: {
      years: result["years"],
      months: result["months"],
      weeks: result["weeks"],
      days: result["days"],
      hours: result["hours"],
      minutes: result["minutes"],
      seconds: result["seconds"],
      ms: result["ms"],
      fullTime: () =>
        units
          .map((unit) =>
            result[unit.name] ? `${result[unit.name]}${unit.name[0]}` : "",
          )
          .filter(Boolean)
          .join(" "),
    },
  };
}

function parseTime(time: string): { ms: number; format: string } {
  if (typeof time !== "string") {
    throw new TypeError("'time' must be a string");
  }

  const timeUnits: Record<string, number> = {
    y: 31536000000,
    mon: 2628002880,
    w: 604800000,
    d: 86400000,
    h: 3600000,
    min: 60000,
    s: 1000,
    ms: 1,
  };

  const regex = /(\d+)(y|mon|w|d|h|min|s|ms)/g;
  let match;
  let ms = 0;
  let format = [];

  while ((match = regex.exec(time)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    ms += value * timeUnits[unit];
    format.push(pluralize(value, unit));
  }

  return {
    ms,
    format: format.join(", "),
  };
}

function pluralize(num: number, unit: string): string {
  const unitsMap: Record<string, string> = {
    y: "year",
    mon: "month",
    w: "week",
    d: "day",
    h: "hour",
    min: "minute",
    s: "second",
    ms: "millisecond",
  };
  return `${num} ${unitsMap[unit]}${num !== 1 ? "s" : ""}`;
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
  return Object.entries(date).reduce((text, [unit, value]) => {
    const regex = new RegExp(`%${unit}%`, "g");
    return text.replace(
      regex,
      typeof value === "function" ? value() : `${value}`,
    );
  }, text);
}

const types = {
  isInteger,
  isFloat,
  isBoolean,
  isObject,
  isArray,
  isNumber,
  isChat,
  isUrl,
  isTime,
};

export { toParse, toConvertParse, formatTime, pluralize, replaceData, types };
