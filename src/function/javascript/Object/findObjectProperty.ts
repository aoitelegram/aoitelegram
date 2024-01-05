export default {
  name: "$findObjectProperty",
  callback: (context) => {
    context.argsCheck(2);
    const [object, property, format = false] = context.splits;
    context.checkArgumentTypes(["object", "string", "boolean | undefined"]);

    if (context.isError) return;

    const findObject = JSON.parse(JSON.stringify(object));
    const properties = {};
    for (const prop in findObject) {
      if (prop === property) {
        properties[prop] = findObject[prop];
      }
    }

    return JSON.stringify(properties, null, format === true ? 2 : 0);
  },
};
