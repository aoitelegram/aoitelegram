import { DataFunction } from "context";

const data: DataFunction = {
  name: "$async",
  callback: (ctx) => {
    new Promise((res, rej) => {
      ctx.evaluateArgs(ctx.getArgs()).then(res).catch(rej);
    });
    return undefined;
  },
};

export { data };
