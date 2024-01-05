export default {
  name: "$commandInfo",
  callback: (context) => {
    context.argsCheck(1);
    if (context.isError) return;

    const [commandName, options = "code"] = context.splits;
    const commands = context.telegram.commands.get({ name: commandName });
    return commands[options];
  },
};
