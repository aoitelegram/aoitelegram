export default {
  name: "$argsCount",
  callback: async (ctx, event, database, error) => {
    const args = event.text?.split(/\s+/) || 0;
    return args.length;
  },
};
