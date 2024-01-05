export default {
  name: "$randomText",
  callback: (context) => {
    context.argsCheck(2);
    const args = context.splits;
    if (context.isError) return;

    const randomIndex = Math.floor(Math.random() * args.length);

    return args[randomIndex];
  },
};
