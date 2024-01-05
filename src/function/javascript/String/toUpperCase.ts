export default {
  name: "$toUpperCase",
  callback: (context) => {
    context.argsCheck(1);
    if (context.isError) return;

    return `${context.inside}`.toUpperCase();
  },
};
