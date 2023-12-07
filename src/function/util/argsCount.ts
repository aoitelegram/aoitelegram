export default {
  name: "$argsCount",
  callback: async (ctx, event, database, error) => {
    const args = event.text?.split(/\s+/) || [];
    return args.length === 0 ? 0 : args.length - 1;
  },
};
