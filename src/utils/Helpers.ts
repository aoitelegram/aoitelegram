function getObjectKey<T extends Record<string, any>>(
  object: T,
  property: string,
  parse: boolean = true,
) {
  try {
    const resultProperty = property.startsWith("[")
      ? eval(`object${property}`)
      : eval(`object.${property}`);
    return {
      isError: false,
      result:
        typeof resultProperty === "object"
          ? JSON.stringify(resultProperty)
          : resultProperty,
    };
  } catch (err) {
    return {
      isError: true,
      result: err,
    };
  }
}

export { getObjectKey };
