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

function removePattern(name: string): string {
  return name.split(":")[0];
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

export { getObjectKey, removePattern, inspect, toTitleCase };
