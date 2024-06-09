import { AoiManager } from "@structures/AoiManager";
import type { ChatFullInfo } from "@telegram.ts/types";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

type DataChat = {
  top: number;
  value: string;
  title?: string;
  description?: string;
  invite_link?: string;
} & ChatFullInfo;

function replaceText(text: string, chatData: DataChat) {
  return text
    .replace(/{top}/g, `${chatData.top}`)
    .replace(/{id}/g, `${chatData.id}`)
    .replace(/{type}/g, `${chatData.type}`)
    .replace(/{title}/g, `${chatData?.title}`)
    .replace(/{description}/g, `${chatData?.description}`)
    .replace(/{invite_link}/g, `${chatData?.invite_link}`)
    .replace(/{value}/g, `${chatData.value}`);
}

export default new AoiFunction()
  .setName("$userLeaderBoard")
  .setBrackets(true)
  .setFields({
    name: "variable",
    required: true,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "chatId",
    required: false,
    type: [ArgsType.Number],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData?.message?.chat?.id,
  })
  .setFields({
    name: "type",
    required: false,
    type: [ArgsType.Any],
    defaultValue: "asc",
  })
  .setFields({
    name: "text",
    required: false,
    type: [ArgsType.Any],
    defaultValue: "{top}. {username} - {value}\n",
  })
  .setFields({
    name: "maxUser",
    required: false,
    type: [ArgsType.Number],
    defaultValue: 10,
  })
  .setFields({
    name: "table",
    required: false,
    type: [ArgsType.Any],
    defaultValue: (context) => context.database.tables[0],
  })
  .onCallback(async (context, func) => {
    if (!(context.database instanceof AoiManager)) {
      return func.reject(
        "You can use this function only if the class for the database is a built-in class.",
      );
    }

    const [variable, chatId, type, text, maxUser, table] =
      await func.resolveFields(context);

    if (!(await context.database.hasTable(table))) {
      return func.reject(`Invalid table "${table}" not found`);
    }

    if (!context.database.collection.has(`${variable}_${table}`)) {
      return func.reject(`Invalid variable "${variable}" not found`);
    }

    const userList = await context.database.findMany(
      table,
      ({ key, value }) => {
        const [, userIdKey, , variableKey] = key.split("_");
        return (
          `user_${userIdKey}_${chatId}_${variableKey}` ===
            `user_${userIdKey}_${chatId}_${variable}` && !isNaN(Number(value))
        );
      },
    );

    userList.sort((a, b) => {
      return type === "asc" ? b.value - a.value : a.value - b.value;
    });

    let textResult = "";

    for (let i = 0; i < userList.length; i++) {
      if (i + 1 === maxUser) break;

      const [userId, value] = [
        userList[i].key.split("_")[1],
        userList[i].key,
        userList[i].value,
      ];
      const chatData = await context.telegram.getChatMember(
        chatId,
        Number(userId),
      );

      textResult += replaceText(text, {
        ...chatData,
        value,
        top: i + 1,
      } as any);
    }

    return func.resolve(textResult);
  });
