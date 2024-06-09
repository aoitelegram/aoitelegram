import { BufferID } from "../index";
import { Buffer } from "node:buffer";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$bufferCreate")
  .setBrackets(true)
  .setFields({
    name: "name",
    type: [ArgsType.Any],
    converType: ArgsType.String,
    required: true,
  })
  .onCallback(async (context, func) => {
    const [name] = await func.resolveFields(context);
    context.variable.set(BufferID, Buffer.alloc(0));
    return func.resolve(true);
  });
