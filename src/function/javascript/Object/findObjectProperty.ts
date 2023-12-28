export default {
  name: "$findObjectProperty",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$findObjectProperty");
    const [object, property, format = false] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([object, property, format], error, [
      "object",
      "string",
      "boolean",
    ]);

    const properties = {};
    for (const prop in object) {
      if (prop === property) {
        properties[prop] = object[prop];
      }
    }

    return JSON.stringify(properties, null, format === true ? 2 : 0);
  },
};
