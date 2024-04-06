function getObjectKey<T extends Record<string, any>>(
  object: T,
  property: string,
  parse: boolean = true,
) {
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
  } else if (typeof obj === "string") {
    return `"${obj}"`;
  } else {
    return String(obj);
  }
}

export { getObjectKey, inspect };
