import { HttpID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$httpAddHeader")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "value",
    rest: true,
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [name, ...value] = await func.resolveFields(context);
    const httpData = context.variable.get(HttpID);
    httpData["headers"] = value.join(";");
    context.variable.set(HttpID, httpData);
    return func.resolve(true);
  });
