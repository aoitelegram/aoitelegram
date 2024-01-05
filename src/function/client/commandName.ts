export default {
  name: "$commandName",
  callback: (context) => {
    return context.command.command ? context.command.name : undefined;
  },
};
