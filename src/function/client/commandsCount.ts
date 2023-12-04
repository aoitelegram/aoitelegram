export default {
  name: "$commandsCount",
  callback: async (ctx, event, database, error) => {
    return event.telegram?.commands.size;
  },
};
