import { BufferID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$bufferLength")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .onCallback(async (context, func) => {
    const [name] = await func.resolveFields(context);
    const variableBuffer = context.variable.get(BufferID);

    if (!variableBuffer?.[name]) {
      return func.reject(
        `The specified variable "${name}" does not exist for the buffer`,
      );
    }

    return func.resolve(variableBuffer[name].length);
  });
