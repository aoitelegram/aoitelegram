export default {
  name: "$getObjectKeys",
  callback: (context) => {
    context.argsCheck(1);
    const [object, sep = ", "] = context.splits;
    context.checkArgumentTypes(["object", "unknown"]);
    if (context.isError) return;

    const keys: unknown[] = [];

    const stack = [JSON.parse(JSON.stringify(object))];

    while (stack.length > 0) {
      const current = stack.pop();
      for (const key in current) {
        keys.push(key);
        if (typeof current[key] === "object") {
          stack.push(current[key]);
        }
      }
    }

    return keys.length > 0 ? keys.join(sep) : "";
  },
};
