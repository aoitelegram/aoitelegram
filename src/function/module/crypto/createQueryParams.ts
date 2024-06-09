import { stringify } from "node:querystring";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$createQueryParams")
  .setBrackets(true)
  .setFields({
    name: "params",
    required: true,
    type: [ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [params] = await func.resolveFields(context);
    return func.resolve(stringify(params));
  });
