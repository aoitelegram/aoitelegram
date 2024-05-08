function getObjectKey<T extends Record<string, any>>(
  object: T,
  property: string,
  parse: boolean = true,
): string {
  try {
    const resultProperty = property.startsWith("[")
      ? eval(`object${property}`)
      : eval(`object.${property}`);
    return inspect(resultProperty);
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
  const trimmedStr = str.trim();

  if (trimmedStr.startsWith("{") && trimmedStr.endsWith("}")) {
    const innerStr = trimmedStr.slice(1, -1);
    const keyValuePairs = innerStr
      .split(",")
      .map((pair) => (pair ? pair.trim() : pair));

    const obj: { [key: string]: any } = {};
    keyValuePairs.forEach((pair) => {
      if (pair) {
        const [key, value] = pair.split(":").map((item) => item.trim());
        obj[key.slice(1, -1)] = unInspect(value);
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

/**
 * Returns a title-cased text.
 * @param str - The text to title-case.
 * @returns {string}
 */
function toTitleCase(str: string) {
  return str
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export { getObjectKey, inspect, unInspect, toTitleCase };
