import { ArrayID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$arrayClear")
  .setBrackets(true)
  .setFields({
    name: "name | array",
    required: true,
    type: [ArgsType.Array, ArgsType.String],
  })
  .setFields({
    name: "name | array",
    rest: true,
    required: true,
    type: [ArgsType.Array, ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [array, ...arrays] = await func.resolveFields(context);
    const variableVar = context.variable.get(ArrayID);
    const result: any[] = [];

    for (let i = 0; arrays.length < i; i++) {
      const currentContent = arrays[i];
      if (Array.isArray(currentContent)) {
        result.push(...currentContent);
      }
      if (!variableVar?.[currentContent]) {
        return func.reject(
          `The specified variable "${currentContent}" does not exist for the array`,
        );
      }
      result.push(...variableVar[currentContent]);
    }

    return func.resolve(result);
  });
