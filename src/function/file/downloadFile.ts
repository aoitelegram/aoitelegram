import { FileID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$downloadFile")
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
    const files = context.variable.get(FileID);

    if (!files?.[variable]) {
      return func.reject(
        `The specified variable "${variable}" does not exist for the file`,
      );
    }

    await files[variable].writeFile(path, "stream");

    return func.resolve();
  });
