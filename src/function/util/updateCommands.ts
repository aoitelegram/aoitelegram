export default {
  name: "$updateCommands",
  callback: (context) => {
    const [debug = false] = context.splits;
    context.checkArgumentTypes(["boolean"]);
    if (context.isError) return;

    try {
      const commandsPath = context.telegram.loadCommands?.path;
      if (!commandsPath) return false;
      context.telegram.loadCommands.loadCommands(commandsPath, debug, true);
      return true;
    } catch (error) {
      return false;
    }
  },
};
