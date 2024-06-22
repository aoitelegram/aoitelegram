import { ObjectID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$assignObject")
  .setBrackets(true)
  .setAliases("$objectAssign")
  .setFields({
    name: "object",
    rest: true,
    required: true,
    type: [ArgsType.String, ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [...obj] = await func.resolveFields(context);
    const variableObject = context.variable.get(ObjectID);
    const assignObject: Record<string, any> = {};

    for (const object of obj) {
      if (typeof object === "string") {
        if (!variableObject?.[object]) {
          return func.reject(
            `The specified variable "${object}" does not exist for the object`,
          );
        }
        assignObject.assign(variableObject[object]);
      } else assignObject.assign(object);
    }

    return func.resolve(assignObject);
  });
