function toArray(
  input: string,
): (string | number | boolean | object)[] | string {
  if (!input?.startsWith("[") && !input.endsWith("]")) return input;
  try {
    const arrayValues = input
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim());

    const resultArray: (string | number | boolean | object)[] = [];

    arrayValues.forEach((value) => {
      if (value === "true" || value === "false") {
        resultArray.push(value === "true");
      } else if (!isNaN(Number(value))) {
        resultArray.push(Number(value));
      } else if (value.startsWith("{") && value.endsWith("}")) {
        try {
          resultArray.push(JSON.parse(value));
        } catch {
          resultArray.push(value);
        }
      } else {
        resultArray.push(value);
      }
    });

    return resultArray;
  } catch (error) {
    throw new Error(
      "Invalid input format. Please provide a valid array string.",
    );
  }
}

export { toArray };
