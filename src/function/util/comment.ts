export default {
  name: "$comment",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$comment");
    return "";
  },
};
