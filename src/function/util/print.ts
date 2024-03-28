export default {
  name: "$print",
  brackets: true,
  fields: [
    {
      name: "optiond",
      required: true,
    },
  ],
  callback: (context, func) => {
    console.log(context, func);
    return func.resolve("");
  },
};
