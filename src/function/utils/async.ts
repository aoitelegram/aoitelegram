import { Context } from "context";

export const data = {
  name: "$async",
  callback: (ctx: Context) => {
    new Promise((res, rej) => {
      ctx.evaluateArgs(ctx.getArgs()).then(res).catch(rej);
    });
    return "";
  },
};
