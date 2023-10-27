import { DataFunction } from "context";

const data: DataFunction = {
  name: "$commandInfo",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$commandInfo")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    let commands;
    for await (const command of event.telegram?.commands ?? []) {
      if (command.name === args[0] || command.data === args[0])
        commands = command;
    }

    return commands?.[args[1] ?? "code"] ?? null;
  },
};

export { data };
