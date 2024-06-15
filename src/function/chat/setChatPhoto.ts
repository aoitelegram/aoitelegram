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
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [chat_id, photo] = await func.resolveFields(context);

    const result = await context.telegram.setChatPhoto(
      chat_id,
      photo?.startsWith("http") ? photo : context.variable.get(FileAnswerID),
    );
    return func.resolve(result);
  });
