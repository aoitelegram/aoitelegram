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
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$chatLeaderBoard");

    const args = await ctx.getEvaluateArgs();
    const defaultTable = args[4] || database.tables[0];

    ctx.checkArgumentTypes(args, error, [
      "string",
      "string | undefined",
      "string | undefined",
      "number | undefined",
      "number | undefined",
      "string | undefined",
    ]);

    let leaderboardText = "";
    let chats: ChatsData[] = [];
    const allEntries = await database.all(defaultTable);

    for (const entryKey in allEntries) {
      const entryValue = await database.get(defaultTable, entryKey);
      const [, chatId] = entryKey.split("_");
      if (`chat_${chatId}_${args[0]}` !== entryKey) continue;

      if (!isNaN(Number(entryValue))) {
        chats.push({ entry: Number(entryValue), chat: entryKey });
      } else continue;
    }

    if (args[1] === "asc" || !args[1]) {
      chats.sort((a, b) => Number(b.entry) - Number(a.entry));
    } else if (args[1] === "dsc") {
      chats.sort((a, b) => Number(a.entry) - Number(b.entry));
    }

    for (let index = 0; index < chats.length; index++) {
      if (index + 1 === Number(args[3] || 10)) break;
      const [, chat] = chats[index].chat.split("_");
      const chatUserData =
        (await event.getChat(chat).catch((err) => console.log(err))) ?? {};
      leaderboardText += replaceText(args[2], {
        ...chatUserData,
        value: chats[index].entry,
        top: index + 1,
      });
    }

    return leaderboardText || undefined;
  },
};
