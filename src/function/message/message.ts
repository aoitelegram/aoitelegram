export default {
  name: "$message",
  callback: async (ctx, event, database, error) => {
    const text = event.text || event.message?.text;
    const [index] = await ctx.getEvaluateArgs();
    let textSplit: string[] | undefined = text?.startsWith("/")
      ? text.split(/\s+/).slice(1)
      : text.split(/\s+/);
    const argsFunc = textSplit?.[Number(index) - 1];
    const noArgsFunc = textSplit?.join?.(" ");
    return index === undefined ? `${noArgsFunc}` : `${argsFunc}`;
  },
};
