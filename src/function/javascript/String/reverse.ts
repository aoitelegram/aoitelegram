export default {
  name: "$reverse",
  callback: async (context) => {
    context.argsCheck(1);
    const text = context.inside;
    if (context.isError) return;

    const result = text.split("").reverse().join("");
    return result;
  },
};
