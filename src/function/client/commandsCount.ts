export default {
  name: "$commandsCount",
  callback: (context) => {
    return context.telegram.commands.size;
  },
};
