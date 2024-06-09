import { BufferID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$bufferReadUtf8")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .setFields({
    name: "startIndex",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "endindex",
    required: false,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [name, startIndex, endindex] = await func.resolveFields(context);
    const variableBuffer = context.variable.get(BufferID);

    if (!variableBuffer?.[name]) {
      return func.reject(
        `The specified variable "${name}" does not exist for the buffer`,
      );
    }

    return func.resolve(
      variableBuffer[name].toString("utf-8", startIndex, endindex),
    );
  });
