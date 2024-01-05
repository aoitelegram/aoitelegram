export default {
  name: "$suppressErrors",
  callback: (context) => {
    context.argsCheck(1);
    if (context.isError) return;

    const text = context.inside;
    context.suppressErrors = text;
    return "";
  },
};
