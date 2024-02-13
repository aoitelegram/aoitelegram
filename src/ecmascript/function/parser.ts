/**
 * Checks if a string represents a valid integer.
 * @param content - The string to check.
 * @returns True if the string is a valid integer, otherwise false.
 */
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

/**
 * Checks if a string represents a valid floating-point number.
 * @param content - The string to check.
 * @returns True if the string is a valid floating-point number, otherwise false.
 */
function isFloat(content: string) {
  if (!content.includes(".")) return false;
  if (!Number.isNaN(parseFloat(content))) return true;
  else return false;
}

/**
 * Checks if a string represents a boolean value ("true" or "false").
 * @param content - The string to check.
 * @returns True if the string represents a boolean value, otherwise false.
 */
function isBoolean(content: string) {
  if (content === "true") return true;
  else if (content === "false") return true;
  else return false;
}

/**
 * Checks if a string represents the value null.
 * @param content - The string to check.
 * @returns True if the string represents the value null, otherwise false.
 */
function isNull(content: string) {
  if (content === "null") return true;
  else return false;
}

/**
 * Checks if a string represents a valid JSON object.
 * @param content - The string to check.
 * @returns True if the string is a valid JSON object, otherwise false.
 */
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

/**
 * Checks if a string represents the value "undefined".
 * @param content - The string to check.
 * @returns True if the string represents the value "undefined", otherwise false.
 */
function isUndefined(content: string) {
  if (content === "undefined") return true;
  else if (content.trim() === "") return true;
  else return false;
}

/**
 * Checks if a string represents the value "NaN".
 * @param content - The string to check.
 * @returns True if the string represents the value "NaN", otherwise false.
 */
function isNaN(content: string) {
  if (content === "NaN") return true;
  else return false;
}

/**
 * Checks if a string represents the value "number".
 * @param content - The string to check.
 * @returns True if the string represents the value "number", otherwise false.
 */
function isNumber(content: string) {
  return isFloat(content) || isInteger(content);
}

/**
 * Checks typeof value.
 * @param character - The string to check.
 */
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

/**
 * Convert typeof value.
 * @param character - The string to convert.
 */
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

interface Data {
  [key: string]: any;
}

/**
 * Retrieves a nested property value from an object based on the provided path.
 * @template T - The type of the input data object.
 * @template K - The key type of the property to retrieve from the object.
 * @param {T} data - The input data object.
 * @param {string} path - The dot-separated path of the property to retrieve.
 * @returns {T[K] | undefined} - The value of the nested property or undefined if not found.
 */
function getObjectKey<T extends Data, K extends keyof T>(
  data: T,
  path: string,
): T[K] {
  if (!path) return data as T[K];
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

/**
 * Retrieves a set value to property key from an object based on the provided path.
 * @template T - The type of the input data object.
 * @template K - The key type of the property to retrieve from the object.
 * @param {T} data - The input data object.
 * @param {string} path - The dot-separated path of the property to retrieve.
 * @param {unknown} newValue - The to set value.
 * @returns {T[K] | undefined} - The value of the nested property or undefined if not found.
 */
function setObjectKey<T extends Data, K extends keyof T>(
  data: T,
  path: string,
  newValue: T[K],
): T {
  if (!path) return newValue as T;

  const properties = path.split(".");

  function setProperty(obj: Data, props: string[], value: any): any {
    const [currentProp, ...rest] = props;
    if (obj && obj[currentProp]) {
      if (rest.length > 0) {
        obj[currentProp] = setProperty(obj[currentProp], rest, value);
      } else {
        obj[currentProp] = value;
      }
    }
    return obj;
  }

  return setProperty({ ...data }, properties, newValue);
}

/**
 * Formats the given time duration in milliseconds into a structured time object.
 * @param milliseconds - The time duration in milliseconds.
 */
function formatTime(milliseconds: number) {
  /**
   * Calculates the value of a specific time unit based on the given milliseconds.
   * @param unitInMilliseconds - The duration of the time unit in milliseconds.
   * @returns The calculated value of the time unit.
   */
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

/**
 * Replaces placeholders in the given text with corresponding values from the provided date object.
 * @param date - The date object containing unit values.
 * @param text - The text containing placeholders to be replaced.
 */
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

/**
 * Retrieves the value at a given index in an array.
 * Supports negative indices, where -1 corresponds to the last element, -2 to the second-to-last, and so on.
 * @param arr - The input array or array-like object.
 * @param index - The index to retrieve the value from.
 * @returns The value at the specified index, or undefined if index is out of range.
 * @template T
 */
function arrayAt<T>(arr: ArrayLike<T>, index: number): T | undefined {
  const realIndex = index >= 0 ? index : arr.length + index;
  return arr[realIndex];
}

export {
  toParse,
  toConvertParse,
  getObjectKey,
  setObjectKey,
  formatTime,
  replaceData,
  arrayAt,
};
