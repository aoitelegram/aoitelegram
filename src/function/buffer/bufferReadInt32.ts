import { BufferID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$bufferReadInt32")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .setFields({
    name: "index",
    required: false,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [name, index] = await func.resolveFields(context);
    const variableBuffer = context.variable.get(BufferID);

    if (!variableBuffer?.[name]) {
      return func.reject(
        `The specified variable "${name}" does not exist for the buffer`,
      );
    }

    return func.resolve(variableBuffer[name]?.readInt32LE(index));
  });
