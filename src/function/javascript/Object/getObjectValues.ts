export default {
  name: "$getObjectValues",
  callback: (context) => {
    context.argsCheck(1);
    const [object, sep = ", "] = context.splits;
    context.checkArgumentTypes(["object", "unknown"]);

    if (context.isError) return;

    let values: unknown[] = [];

    const stack = [JSON.parse(JSON.stringify(object))];

    while (stack.length > 0) {
      const current = stack.pop();
      for (const key in current) {
        const value = current?.[key];
        if (Array.isArray(value)) {
          values.push(...value);
        } else if (typeof value === "object") {
          stack.push(value);
        } else {
          values.push(value);
        }
      }
    }

    return values.length > 0 ? values.join(sep) : "";
  },
};
