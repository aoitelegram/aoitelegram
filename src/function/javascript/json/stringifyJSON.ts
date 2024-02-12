export default {
  name: "$stringifyJSON",
  callback: (context) => {
    context.argsCheck(1);
    const object = context.inside;
    if (context.isError) return;

    return JSON.stringify(object);
  },
};
