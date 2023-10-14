export const data = {
  name: "$async",
  callback: (ctx: any) => {
    new Promise((res, rej) => {
      ctx.evaluateArgs(ctx.getArgs()).then(res).catch(rej);
    });
    return "";
  },
};
