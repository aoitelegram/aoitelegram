import { HttpID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$httpRemoveHeader")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [name] = await func.resolveFields(context);
    const httpData = context.variable.get(HttpID);
    delete httpData.headers?.[name];
    context.variable.set(HttpID, httpData);
    return func.resolve(true);
  });
