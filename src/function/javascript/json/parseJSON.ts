export default {
  name: "$parseJSON",
  callback: (context) => {
    context.argsCheck(1);
    const object = context.inside;
    if (context.isError) return;

    return JSON.parse(object);
  },
};
