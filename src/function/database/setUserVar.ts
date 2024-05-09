import { AoiManager } from "@structures/AoiManager";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setUserVar")
  .setBrackets(true)
  .setFields({
    name: "variable",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "value",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "userId",
    required: false,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    if (!(context.database instanceof AoiManager)) {
      return func.reject(
        "You can use this function only if the class for the database is a built-in class.",
      );
    }

    const [
      variable,
      value,
      userId = context.eventData.from?.id ||
        context.eventData.message?.from?.id,
      table = context.database.tables[0],
    ] = await func.resolveFields(context);

    const chatId =
      context.eventData.chat?.id || context.eventData.message?.chat.id;

    if (!(await context.database.has(table, variable))) {
      return func.reject(`Invalid variable ${variable} not found`);
    }

    await context.database.set(
      table,
      `user_${userId}_${chatId}_${variable}`,
      value,
    );

    return func.resolve(true);
  });
