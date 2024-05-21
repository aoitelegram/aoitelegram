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

function inspect(obj: any): string {
  if (typeof obj === "object") {
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

function unInspect(str: string): any {
  const trimmedStr = str || "";

  if (trimmedStr.startsWith("{") && trimmedStr.endsWith("}")) {
    const innerStr = trimmedStr.slice(1, -1);
    const keyValuePairs = innerStr
      .split(",")
      .map((pair) => (pair ? pair.trim() : pair));

    const obj: { [key: string]: any } = {};
    keyValuePairs.forEach((pair) => {
      if (pair) {
        const [rawKey, value] = pair.split(":").map((item) => item.trim());
        const key =
          rawKey.startsWith('"') && rawKey.endsWith('"')
            ? rawKey.slice(1, -1)
            : rawKey;
        obj[key] = unInspect(value);
      }
    });

    return obj;
  } else if (trimmedStr.startsWith("[") && trimmedStr.endsWith("]")) {
    const innerStr = trimmedStr.slice(1, -1);
    const elements = innerStr
      ? innerStr.split(",").map((item) => item.trim())
      : [];
    return elements.map(unInspect);
  } else {
    if (trimmedStr === "undefined") return undefined;
    if (trimmedStr === "null") return null;
    if (trimmedStr === "true") return true;
    if (trimmedStr === "false") return false;
    if (!isNaN(Number(trimmedStr)) && trimmedStr !== "")
      return Number(trimmedStr);
    if (trimmedStr.startsWith('"') && trimmedStr.endsWith('"')) {
      return trimmedStr.slice(1, -1);
    } else {
      return trimmedStr;
    }
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
