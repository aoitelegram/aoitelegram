import { AoiManager } from "@structures/AoiManager";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setChatVar")
  .setBrackets(true)
  .setFields({
    name: "variable",
    required: true,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "value",
    required: true,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "chatId",
    required: false,
    type: [ArgsType.Number],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .setFields({
    name: "table",
    required: false,
    type: [ArgsType.Number],
    defaultValue: (context) => context.database.tables[0],
  })
  .onCallback(async (context, func) => {
    const [variable, value, chatId, table] = await func.resolveFields(context);

    if (!(await context.database.hasTable(table))) {
      return func.reject(`Invalid table "${table}" not found`);
    }

    if (!context.database.collection.has(`${variable}_${table}`)) {
      return func.reject(`Invalid variable "${variable}" not found`);
    }

    await context.database.set(table, `chat_${chatId}_${variable}`, value);

    return func.resolve(true);
  });
