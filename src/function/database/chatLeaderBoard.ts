import { AoiManager } from "@structures/AoiManager";
import type { ChatFullInfo } from "@telegram.ts/types";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

type DataChat = {
  top: number;
  value: number;
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
  .setName("$chatLeaderBoard")
  .setBrackets(true)
  .setFields({
    name: "variable",
    required: true,
    type: [ArgsType.Any],
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
    defaultValue: "{top}. {title} - {value}\n",
  })
  .setFields({
    name: "maxChat",
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

    const [variable, type, text, maxChat, table] =
      await func.resolveFields(context);

    if (!(await context.database.hasTable(table))) {
      return func.reject(`Invalid table "${table}" not found`);
    }

    if (!context.database.collection.has(`${variable}_${table}`)) {
      return func.reject(`Invalid variable "${variable}" not found`);
    }

    const chatList = await context.database.findMany(
      table,
      ({ key, value }) => {
        const [, chatIdKey, variableKey] = key.split("_");
        return (
          `chat_${chatIdKey}_${variableKey}` ===
            `chat_${chatIdKey}_${variable}` && !isNaN(Number(value))
        );
      },
    );

    chatList.sort((a, b) => {
      return type === "asc" ? b.value - a.value : a.value - b.value;
    });

    let textResult = "";

    for (let i = 0; i < chatList.length; i++) {
      if (i + 1 === maxChat) break;

      const [chatId, value] = [
        chatList[i].key.split("_")[1],
        chatList[i].value,
      ];
      const chatData = await context.telegram.getChat(chatId);

      textResult += replaceText(text, {
        ...chatData,
        value,
        top: i + 1,
      });
    }

    return func.resolve(textResult);
  });
