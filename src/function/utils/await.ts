import { DataFunction } from "context";

const data: DataFunction = {
  name: "$await",
  callback: async (ctx) => {
    const [time = 1] = await ctx.evaluateArgs(ctx.getArgs(0, 1));
    return new Promise((res) => setTimeout(() => res(""), time * 1000));
  },
};

export { data };
