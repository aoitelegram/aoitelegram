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
  if (content?.startsWith("{") && content.endsWith("}")) {
    try {
      return !!JSON.parse(content);
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
      return JSON.parse(character);
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
  character = `${character}`;
  switch (true) {
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
    case isUndefined(character):
      return "undefined";
    default:
      return "unknown";
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

export { parse, toParse, getObjectKey };
