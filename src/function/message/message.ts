import { Context } from "context";

export const data = {
  name: "$message",
  callback: async (ctx: Context, event: any) => {
    const text = event.text ?? event.message?.text;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    let textSplit: string[] | undefined = text?.startsWith("/")
      ? text?.split(/\s+/).slice(1)
      : text?.split(/\s+/);
    const argsFunc = textSplit?.[Number(args[0]) - 1];
    const noArgsFunc = textSplit?.join(" ");
    return args[0] === undefined ? noArgsFunc : argsFunc;
  },
};
