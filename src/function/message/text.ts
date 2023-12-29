export default {
  name: "$text",
  callback: async (ctx, event, database, error) => {
    const text = event.text || event.message?.text;
    const [index] = await ctx.getEvaluateArgs();
    let textSplit: string[] | undefined = text?.split(/\s+/);
    const argsFunc = textSplit?.[Number(index) - 1];
    const noArgsFunc = textSplit?.join?.(" ");
    return index === undefined ? `${noArgsFunc}` : `${argsFunc}`;
  },
};
