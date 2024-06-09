import { BufferID } from "../index";
import { Buffer } from "node:buffer";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$bufferAllocUnsafe")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .setFields({
    name: "bytes",
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [name, bytes] = await func.resolveFields(context);
    const variableBuffer = context.variable.get(BufferID);

    if (!variableBuffer?.[name]) {
      return func.reject(
        `The specified variable "${name}" does not exist for the buffer`,
      );
    }

    variableBuffer[name] = Buffer.allocUnsafe(bytes);
    context.variable.set(BufferID, variableBuffer);
    return func.resolve(variableBuffer[name]);
  });
