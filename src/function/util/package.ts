import packageJSON from "../../../package.json";
import { getObjectKey } from "@utils/Helpers";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$package")
  .setBrackets(true)
  .setFields({
    name: "property",
    required: false,
    type: [ArgsType.Any],
    defaultValue: "version",
  })
  .onCallback(async (context, func) => {
    const [property] = await func.resolveFields(context);
    return func.resolve(getObjectKey(packageJSON, property));
  });
