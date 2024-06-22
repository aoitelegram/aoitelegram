import { ObjectID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$objectValues")
  .setBrackets(true)
  .setAliases("$valuesObject")
  .setFields({
    name: "object",
    required: true,
    type: [ArgsType.String, ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [obj] = await func.resolveFields(context);
    const variableObject = context.variable.get(ObjectID);

    if (typeof obj === "string") {
      if (!variableObject?.[obj]) {
        return func.reject(
          `The specified variable "${obj}" does not exist for the object`,
        );
      }
      return func.resolve(Object.values(variableObject[obj]));
    }

    return func.resolve(Object.values(obj));
  });
