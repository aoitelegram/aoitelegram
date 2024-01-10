export default {
  name: "$commandName",
  callback: (context) => {
    return context.command.hasCommand ? context.command.name : "";
  },
};
