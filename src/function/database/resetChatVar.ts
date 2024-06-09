import { AoiManager } from "@structures/AoiManager";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$resetChatVar")
  .setBrackets(true)
  .setFields({
    name: "variable",
    required: true,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "chatId",
    required: false,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "table",
    required: false,
    type: [ArgsType.Any],
    defaultValue: async (context) => context.database.tables[0],
  })
  .onCallback(async (context, func) => {
    if (!(context.database instanceof AoiManager)) {
      return func.reject(
        "You can use this function only if the class for the database is a built-in class.",
      );
    }

    const [variable, chatId, table] = await func.resolveFields(context);

    if (!(await context.database.hasTable(table))) {
      return func.reject(`Invalid table "${table}" not found`);
    }

    if (!context.database.collection.has(`${variable}_${table}`)) {
      return func.reject(`Invalid variable "${variable}" not found`);
    }

    const allChats = await context.database.findMany(table, ({ key }) => {
      return `chat_${chatId || key.split("_")[1]}_${variable}` === key;
    });

    for (const { key } of allChats) {
      await context.database.set(
        table,
        key,
        context.database.collection.get(`${variable}_${table}`),
      );
    }

    return func.resolve(allChats.length);
  });
