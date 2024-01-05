export default {
  name: "$print",
  callback: (context) => {
    context.argsCheck(1);
    if (context.isError) return;

    console.log(context.inside);
    return "";
  },
};
