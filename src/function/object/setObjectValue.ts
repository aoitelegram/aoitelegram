import { ObjectID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

function setObjectKey<T extends Record<string, any>, K extends keyof T>(
  data: T,
  path: string,
  newValue: T[K],
): T {
  if (!path) return newValue as T;

  const properties = path.split(".");

  function setProperty(
    obj: Record<string, any>,
    props: string[],
    value: any,
  ): any {
    const [currentProp, ...rest] = props;
    if (obj && obj[currentProp]) {
      if (rest.length > 0) {
        obj[currentProp] = setProperty(obj[currentProp], rest, value);
      } else {
        obj[currentProp] = value;
      }
    }
    return obj;
  }

  return setProperty({ ...data }, properties, newValue);
}

export default new AoiFunction()
  .setName("$setObjectValue")
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
  .setFields({
    name: "value",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [obj, property, value] = await func.resolveFields(context);
    const variableObject = context.variable.get(ObjectID);

    if (typeof obj === "string") {
      if (!variableObject?.[obj]) {
        return func.reject(
          `The specified variable "${obj}" does not exist for the object`,
        );
      }
      variableObject[obj] = setObjectKey(variableObject[obj], property, value);
      context.variable.set(ObjectID, variableObject);
      return func.resolve();
    }

    return func.resolve(setObjectKey(obj, property, value));
  });
