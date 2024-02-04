export default {
  name: "$toLocaleUpperCase",
  callback: (context) => {
    context.argsCheck(1);
    if (context.isError) return;

    return `${context.inside}`.toLocaleUpperCase();
  },
};
