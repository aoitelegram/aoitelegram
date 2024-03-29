function isInteger(content: string) {
  let isBigInt: boolean = false;
  try {
    BigInt(content);
    isBigInt = true;
  } catch (err) {
    isBigInt = false;
  }
  return (
    Number.isInteger(Number(content)) &&
    !isBoolean(content) &&
    !isNull(content) &&
    isBigInt
  );
}

function isFloat(content: string) {
  if (!content.includes(".")) return false;
  if (!Number.isNaN(parseFloat(content))) return true;
  else return false;
}

function isBoolean(content: string) {
  if (content === "true") return true;
  else if (content === "false") return true;
  else return false;
}

function isNull(content: string) {
  if (content === "null") return true;
  else return false;
}

function isObject(content: string) {
  if (content.startsWith("{") && content.endsWith("}")) {
    try {
      return !!JSON.parse(JSON.stringify(content));
    } catch (err) {
      return false;
    }
  }
  return false;
}

function isUndefined(content: string) {
  if (content === "undefined") return true;
  else if (content.trim() === "") return true;
  else return false;
}

function isNaN(content: string) {
  if (content === "NaN") return true;
  else return false;
}

function isNumber(content: string) {
  return isFloat(content) || isInteger(content);
}

function toParse(character?: string) {
  if (!character) return "unknown";
  switch (true) {
    case isUndefined(character):
      return "undefined";
    case isNumber(character):
      return "number";
    case isNaN(character):
      return "nan";
    case isObject(character):
      return "object";
    case isBoolean(character):
      return "boolean";
    case isNull(character):
      return "null";
    default:
      return "string";
  }
}

function toConvertParse(character?: string) {
  if (!character) return undefined;
  switch (true) {
    case isUndefined(character):
      return undefined;
    case isNumber(character):
      return Number(character);
    case isNaN(character):
      return NaN;
    case isObject(character):
      return JSON.parse(character);
    case isBoolean(character):
      return character === "true";
    case isNull(character):
      return null;
    default:
      return character;
  }
}

function formatTime(milliseconds: number) {
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
) {
  Object.entries(date).map((unit) => {
    const regexp = new RegExp(`%${unit[0]}%`, "g");
    text = text.replace(
      regexp,
      typeof unit[1] === "function" ? unit[1]() : `${unit[1]}`,
    );
  });
  return text;
}

function arrayAt<T>(arr: ArrayLike<T>, index: number): T | undefined {
  const realIndex = index >= 0 ? index : arr.length + index;
  return arr[realIndex];
}

export { toParse, toConvertParse, formatTime, replaceData, arrayAt };
