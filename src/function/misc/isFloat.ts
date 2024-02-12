export default {
  name: "$isFloat",
  callback: (context) => {
    context.argsCheck(1);
    const number = context.inside;
    if (context.isError) return;

    return typeof +number === "number" ? number.includes(".") : false;
  },
};
