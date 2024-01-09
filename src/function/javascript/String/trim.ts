export default {
  name: "$trim",
  callback: (context) => {
    context.argsCheck(1);
    const text = context.inside;
    if (context.isError) return;

    return text.trim();
  },
};
