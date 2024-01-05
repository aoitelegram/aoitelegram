interface ChatData {
  top: number;
  id: number;
  title: string;
  type: string;
  value: unknown;
  description: string;
  invite_link: string;
}

interface ChatsData {
  entry: number;
  chat: string;
}

function replaceText(text: string, chatData: ChatData) {
  return text
    .replace(/{top}/g, `${chatData.top}`)
    .replace(/{id}/g, `${chatData.id}`)
    .replace(/{type}/g, `${chatData.type}`)
    .replace(/{title}/g, `${chatData.title}`)
    .replace(/{description}/g, `${chatData.description}`)
    .replace(/{invite_link}/g, `${chatData.invite_link}`)
    .replace(/{value}/g, `${chatData.value}`);
}

export default {
  name: "$chatLeaderBoard",
  callback: async (context) => {
    context.argsCheck(1);

    const [
      variable,
      type = "asc",
      text = "{top}. {title} - {value}",
      maxUser = 10,
      defaultTable = context.database.tables[0],
    ] = context.splits;

    context.checkArgumentTypes([
      "string",
      "string | undefined",
      "string | undefined",
      "number | undefined",
      "number | undefined",
      "string | undefined",
    ]);

    if (context.isError) return;

    let leaderboardText = "";
    let chats: ChatsData[] = [];
    const allEntries = context.database.all(defaultTable);

    for (const entryKey in allEntries) {
      const entryValue = context.database.get(defaultTable, entryKey);
      const [, chatId] = entryKey.split("_");
      if (`chat_${chatId}_${variable}` !== entryKey) continue;

      if (!isNaN(Number(entryValue))) {
        chats.push({ entry: Number(entryValue), chat: entryKey });
      } else continue;
    }

    if (type === "asc") {
      chats.sort((a, b) => Number(b.entry) - Number(a.entry));
    } else if (type === "dsc") {
      chats.sort((a, b) => Number(a.entry) - Number(b.entry));
    }

    for (let index = 0; index < chats.length; index++) {
      if (index + 1 === Number(maxUser)) break;
      const [, chat] = chats[index].chat.split("_");
      const chatUserData =
        (await context.event.getChat(chat).catch((err) => console.log(err))) ??
        {};
      leaderboardText += replaceText(text, {
        ...chatUserData,
        value: chats[index].entry,
        top: index + 1,
      });
    }

    return leaderboardText || undefined;
  },
};
