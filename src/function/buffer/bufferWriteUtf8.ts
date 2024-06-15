import { BufferID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$bufferWriteUtf8")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .setFields({
    name: "index",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [name, index, text] = await func.resolveFields(context);
    const variableBuffer = context.variable.get(BufferID);

    if (!variableBuffer?.[name]) {
      return func.reject(
        `The specified variable "${name}" does not exist for the buffer`,
      );
    }

    return func.resolve(variableBuffer[name].write(text, index));
  });
