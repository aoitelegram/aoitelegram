import { FileID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getFile")
  .setBrackets(true)
  .setFields({
    name: "file_id",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "variable",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [file_id, variable] = await func.resolveFields(context);
    const result = await context.telegram.getFile(file_id);

    if (variable) {
      const files = context.variable.get(FileID);
      files[variable] = result;
      context.variable.set(FileID, files);
    }

    // @ts-ignore
    return func.resolve(result.file);
  });
