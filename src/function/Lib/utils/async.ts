export default {
  name: "$async",
  callback: (ctx) => {
    new Promise((res, rej) => {
      ctx.getEvaluateArgs().then(res).catch(rej);
    });
    return undefined;
  },
};
