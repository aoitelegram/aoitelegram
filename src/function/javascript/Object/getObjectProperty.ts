import { getObjectKey } from "../../parser";

export default {
  name: "$getObjectProperty",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["object"]);
    const object = JSON.parse(JSON.stringify(args[0]));
    return getObjectKey(object, args[1]);
  },
};
