function pushIndexArray(index, value, array) {
  if (!Array.isArray(array[index])) {
    array[index] = [];
  }

  array[index].push(value);
}

export default {
  name: "$addCallbackQuery",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(3, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["number", "string", "string"]);
    pushIndexArray(
      +args[0] - 1,
      {
        text: args[1],
        callback_data: args[2],
      },
      ctx.callback_query,
    );
    return undefined;
  },
};
