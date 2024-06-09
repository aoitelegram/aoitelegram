import { BufferID } from "../index";
import { Buffer } from "node:buffer";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$bufferResize")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .setFields({
    name: "length",
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [name, length] = await func.resolveFields(context);
    const variableBuffer = context.variable.get(BufferID);

    if (!variableBuffer?.[name]) {
      return func.reject(
        `The specified variable "${name}" does not exist for the buffer`,
      );
    }

    const alloc = Buffer.alloc(length);
    variableBuffer[name] = variableBuffer[name].copy(alloc, 0, 0, alloc.length);
    context.variable.set(BufferID, variableBuffer);
    return func.resolve();
  });
