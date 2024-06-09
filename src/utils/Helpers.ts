function getObjectKey<T extends Record<string, any>>(
  object: T,
  property?: undefined,
): T;
function getObjectKey<T extends Record<string, any>>(
  object: T,
  property: string,
  parse?: boolean,
): string;
function getObjectKey<T extends Record<string, any>>(
  object: T,
  property?: string,
  parse: boolean = true,
) {
  if (!property) return object;
  try {
    const resultProperty = property.startsWith("[")
      ? eval(`object${property}`)
      : eval(`object.${property}`);
    return parse ? inspect(resultProperty) : resultProperty;
  } catch (err) {
    return inspect(undefined);
  }
}

function unInspect(str: string): any {
  const trimmedStr = str.trim();

  if (trimmedStr.startsWith("{") && trimmedStr.endsWith("}")) {
    return parseObject(trimmedStr);
  } else if (trimmedStr.startsWith("[") && trimmedStr.endsWith("]")) {
    return parseArray(trimmedStr);
  } else {
    return parseValue(trimmedStr);
  }
}

function parseObject(str: string): any {
  const obj: { [key: string]: any } = {};
  let key = "";
  let value = "";
  let isParsingKey = true;
  let inString = false;
  let currentStringDelimiter = "";
  let bracketCount = 0;

  for (let i = 1; i < str.length - 1; i++) {
    const char = str[i];

    if (char === '"' || char === "'") {
      if (inString && currentStringDelimiter === char) {
        inString = false;
      } else if (!inString) {
        inString = true;
        currentStringDelimiter = char;
      }
    }

    if (inString) {
      if (isParsingKey) {
        key += char;
      } else {
        value += char;
      }
    } else {
      if (char === "{" || char === "[") {
        bracketCount++;
      } else if (char === "}" || char === "]") {
        bracketCount--;
      }

      if (bracketCount === 0 && char === ":" && isParsingKey) {
        isParsingKey = false;
      } else if (bracketCount === 0 && char === "," && !isParsingKey) {
        obj[parseKey(key)] = unInspect(value.trim());
        key = "";
        value = "";
        isParsingKey = true;
      } else {
        if (isParsingKey) {
          key += char;
        } else {
          value += char;
        }
      }
    }
  }

  if (key !== "" && value !== "") {
    obj[parseKey(key)] = unInspect(value.trim());
  }

  return obj;
}

function parseArray(str: string): any[] {
  const arr: any[] = [];
  let value = "";
  let inString = false;
  let currentStringDelimiter = "";
  let bracketCount = 0;

  for (let i = 1; i < str.length - 1; i++) {
    const char = str[i];

    if (char === '"' || char === "'") {
      if (inString && currentStringDelimiter === char) {
        inString = false;
      } else if (!inString) {
        inString = true;
        currentStringDelimiter = char;
      }
    }

    if (inString) {
      value += char;
    } else {
      if (char === "{" || char === "[") {
        bracketCount++;
      } else if (char === "}" || char === "]") {
        bracketCount--;
      }

      if (bracketCount === 0 && char === "," && !inString) {
        arr.push(unInspect(value.trim()));
        value = "";
      } else {
        value += char;
      }
    }
  }

  if (value.trim() !== "") {
    arr.push(unInspect(value.trim()));
  }

  return arr;
}

function parseValue(str: string): any {
  if (str === "undefined") return undefined;
  if (str === "null") return null;
  if (str === "true") return true;
  if (str === "false") return false;
  if (!isNaN(Number(str)) && str !== "") return Number(str);
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    return str.slice(1, -1);
  }
  return str;
}

function parseKey(str: string): string {
  return str.trim().replace(/^["']|["']$/g, "");
}

function inspect(obj: any): string {
  if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(obj)) {
      return "[" + obj.map(inspect).join(", ") + "]";
    } else {
      const entries = Object.entries(obj).map(
        ([key, value]) => `"${key}": ${inspect(value)}`,
      );
      return "{ " + entries.join(", ") + " }";
    }
  } else {
    return String(obj);
  }
}

function unescapeCode(code: string): string {
  return code
    .replace(/@at/gi, "@")
    .replace(/@left/gi, "[")
    .replace(/@right/gi, "]")
    .replace(/@semi/gi, ";")
    .replace(/@colon/gi, ":")
    .replace(/@equal/gi, "=")
    .replace(/@or/gi, "||")
    .replace(/@and/gi, "&&")
    .replace(/@higher/gi, ">")
    .replace(/@lower/gi, "<")
    .replace(/@left_parent/gi, ")")
    .replace(/@right_parent/gi, "(")
    .replace(/@dollar/gi, "$");
}

function escapeCode(code: string): string {
  return code
    .replace(/@/g, "@at")
    .replace(/\]/g, "@right")
    .replace(/\[/g, "@left")
    .replace(/;/g, "@semi")
    .replace(/:/g, "@colon")
    .replace(/=/g, "@equal")
    .replace(/\|\|/g, "@or")
    .replace(/&&/g, "@and")
    .replace(/>/g, "@higher")
    .replace(/</g, "@lower")
    .replace(/\$/g, "@dollar");
}

export { getObjectKey, inspect, unInspect, escapeCode, unescapeCode };
