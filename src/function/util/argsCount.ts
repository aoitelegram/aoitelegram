export default {
  name: "$argsCount",
  callback: (context) => {
    const args = context.event.text?.split(/\s+/) || [];
    return args.length === 0 ? 0 : args.length;
  },
};
