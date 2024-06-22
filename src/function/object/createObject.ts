import { ObjectID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$createObject")
  .setBrackets(true)
  .setAliases("$objectCreate")
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "obj",
    required: true,
    type: [ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [name, obj] = await func.resolveFields(context);
    const variableObject = context.variable.get(ObjectID);
    variableObject[name] = obj;
    context.variable.set(ObjectID, variableObject);
    return func.resolve();
  });
