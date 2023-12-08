const parseStringJSON = require("parsejson");

/**
 * Checks if a string represents a valid integer.
 * @param {string} content - The string to check.
 * @returns {boolean} True if the string is a valid integer, otherwise false.
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
 * @param {string} content - The string to check.
 * @returns {boolean} True if the string is a valid floating-point number, otherwise false.
 */
function isFloat(content: string) {
  if (!content.includes(".")) return false;
  if (!Number.isNaN(parseFloat(content))) return true;
  else return false;
}

/**
 * Checks if a string represents a boolean value ("true" or "false").
 * @param {string} content - The string to check.
 * @returns {boolean} True if the string represents a boolean value, otherwise false.
 */
function isBoolean(content: string) {
  if (content === "true") return true;
  else if (content === "false") return true;
  else return false;
}

/**
 * Checks if a string represents the value null.
 * @param {string} content - The string to check.
 * @returns {boolean} True if the string represents the value null, otherwise false.
 */
function isNull(content: string) {
  if (content === "null") return true;
  else return false;
}

/**
 * Checks if a string represents a valid JSON object.
 * @param {string} content - The string to check.
 * @returns {boolean} True if the string is a valid JSON object, otherwise false.
 */
function isObject(content: string) {
  if (
    (content?.startsWith("{") && content?.endsWith("}")) ||
    typeof content === "object"
  ) {
    console.log(parseJSON(content));
    try {
      return !!parseJSON(content);
    } catch (err) {
      return false;
    }
  }
  return false;
}

/**
 * Checks if a string represents the value "undefined".
 * @param {string} content - The string to check.
 * @returns {boolean} True if the string represents the value "undefined", otherwise false.
 */
function isUndefined(content: string) {
  if (content === "undefined") return true;
  else if (content.trim() === "") return true;
  else return false;
}

/**
 * Checks if a string represents the value "NaN".
 * @param {string} content - The string to check.
 * @returns {boolean} True if the string represents the value "NaN", otherwise false.
 */
function isNaN(content: string) {
  if (content === "NaN") return true;
  else return false;
}

/**
 * Checks if a string represents the value "number".
 * @param {string} content - The string to check.
 * @returns {boolean} True if the string represents the value "number", otherwise false.
 */
function isNumber(content: string) {
  return isFloat(content) || isInteger(content);
}

function parseJSON(objStr: string | object) {
  if (typeof objStr === "object") return objStr;
  if (typeof objStr === "string") {
    return parseStringJSON(objStr) || JSON.parse(objStr);
  }
}

/**
 * Checks typeof value.
 * @param {string} character - The string to check.
 */
function parse(character: string) {
  if (!character) return character;
  switch (true) {
    case isInteger(character):
      return parseInt(character);
    case isFloat(character):
      return parseFloat(character);
    case isNaN(character):
      return NaN;
    case isObject(character):
      return parseJSON(character);
    case isBoolean(character):
      return character === "true";
    case isNull(character):
      return null;
    case isUndefined(character):
      return undefined;
    default:
      return character;
  }
}

/**
 * Checks typeof value.
 * @param {string} character - The string to check.
 */
function toParse(character: string) {
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
 * Formats the given time duration in milliseconds into a structured time object.
 *
 * @param {number} milliseconds - The time duration in milliseconds.
 */
function formatTime(milliseconds: number) {
  /**
   * Calculates the value of a specific time unit based on the given milliseconds.
   * @param {number} unitInMilliseconds - The duration of the time unit in milliseconds.
   * @returns {number} - The calculated value of the time unit.
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
 * @param {{
 *   years: number,
 *   months: number,
 *   weeks: number,
 *   days: number,
 *   hours: number,
 *   minutes: number,
 *   seconds: number,
 *   ms: number
 * }} date - The date object containing unit values.
 * @param {string} text - The text containing placeholders to be replaced.
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
    text = text.replace(regexp, typeof unit[1] === "function" ? unit[1]() : `${unit[1]}`);
  });
  return text;
}

/**
 * Retrieves the value at a given index in an array.
 * Supports negative indices, where -1 corresponds to the last element, -2 to the second-to-last, and so on.
 * @param {ArrayLike<T>} arr - The input array or array-like object.
 * @param {number} index - The index to retrieve the value from.
 * @returns {T | undefined} - The value at the specified index, or undefined if index is out of range.
 * @template T
 */
function arrayAt<T>(arr: ArrayLike<T>, index: number): T | undefined {
  const realIndex = index >= 0 ? index : arr.length + index;
  return arr[realIndex];
}

export { parse, toParse, getObjectKey, formatTime, replaceData, arrayAt };
