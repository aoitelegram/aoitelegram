import { getObjectKey } from "@aoitelegram/util";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getChat")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "property",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [chat_id, property] = await func.resolveFields(context);

    const result = await context.telegram.getChat(chat_id);
    return func.resolve(getObjectKey(result, property));
  });
