import fs from "node:fs/promises";
import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$addFileToAnswer")
  .setBrackets(true)
  .setFields({
    name: "variable",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "path",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [variable, path] = await func.resolveFields(context);
    const files = context.variable.get(FileAnswerID);
    files[variable] = await fs.readFile(path);
    context.variable.set(FileAnswerID, files);
    return func.resolve();
  });
