import fs from "node:fs/promises";
import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$addFileToAnswer")
  .setBrackets(true)
  .setFields({
    name: "path",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [path] = await func.resolveFields(context);
    context.variable.set(FileAnswerID, await fs.readFile(path));
    return func.resolve();
  });
