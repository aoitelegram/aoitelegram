import { ObjectID } from "../index";
import { getObjectKey } from "@aoitelegram/util";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getObjectKey")
  .setBrackets(true)
  .setFields({
    name: "object",
    required: true,
    type: [ArgsType.String, ArgsType.Object],
  })
  .setFields({
    name: "property",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [obj, property] = await func.resolveFields(context);
    const variableObject = context.variable.get(ObjectID);

    if (typeof obj === "string") {
      if (!variableObject?.[obj]) {
        return func.reject(
          `The specified variable "${obj}" does not exist for the object`,
        );
      }
      return func.resolve(getObjectKey(variableObject[obj], property));
    }

    return func.resolve(getObjectKey(obj, property));
  });
