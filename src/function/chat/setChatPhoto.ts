import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setChatPhoto")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "photo",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [chat_id, photo] = await func.resolveFields(context);

    const variableFile = context.variable.get(FileAnswerID);

    if (!variableFile?.[photo] && !photo.startsWith("http")) {
      return func.reject(
        `The specified variable "${photo}" does not exist for the file`,
      );
    }

    const result = await context.telegram.setChatPhoto(
      chat_id,
      photo.startsWith("http") ? photo : variableFile[photo],
    );
    return func.resolve(result);
  });
