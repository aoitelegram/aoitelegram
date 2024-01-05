interface ChatData {
  top: number;
  id: number;
  first_name: string;
  username: string;
  type: string;
  value: unknown;
  last_name?: string;
  language_code?: string;
  bio?: string;
}

interface UsersData {
  entry: number;
  user: string;
}

function replaceText(text: string, chatData: ChatData) {
  return text
    .replace(/{top}/g, `${chatData.top}`)
    .replace(/{id}/g, `${chatData.id}`)
    .replace(/{first_name}/g, `${chatData.first_name}`)
    .replace(/{last_name}/g, `${chatData.last_name}`)
    .replace(/{language_code}/g, `${chatData.language_code}`)
    .replace(/{username}/g, `${chatData.username}`)
    .replace(/{type}/g, `${chatData.type}`)
    .replace(/{value}/g, `${chatData.value}`)
    .replace(/{bio}/g, `${chatData.bio}`);
}

export default {
  name: "$userLeaderBoard",
  callback: async (context) => {
    context.argsCheck(2);

    const [
      chatId = context.event.chat?.id || context.event.message?.chat.id,
      variable,
      text = "{top}. {username} - {value}",
      type = "asc",
      maxUser = 10,
      defaultTable = context.database.tables[0],
    ] = context.splits;
    const userId = context.event.from?.id || context.event.message?.from?.id;

    context.checkArgumentTypes([
      "number | string | undefined",
      "string",
      "string | undefined",
      "string | undefined",
      "number | undefined",
      "number | undefined",
      "string | undefined",
    ]);

    if (context.isError) return;

    let leaderboardText = "";
    let users: UsersData[] = [];
    const allEntries = context.database.all(defaultTable);

    for (const entryKey in allEntries) {
      const entryValue = context.database.get(defaultTable, entryKey);
      const [, userId] = entryKey.split("_");
      if (`user_${userId}_${chatId}_${variable}` !== entryKey) continue;

      if (!isNaN(Number(entryValue))) {
        users.push({ entry: Number(entryValue), user: entryKey });
      } else continue;
    }

    if (type === "asc") {
      users.sort((a, b) => Number(b.entry) - Number(a.entry));
    } else if (type === "dsc") {
      users.sort((a, b) => Number(a.entry) - Number(b.entry));
    }

    for (let index = 0; index < users.length; index++) {
      if (index + 1 === Number(maxUser)) break;
      const [, user] = users[index].user.split("_");
      const chatUserData =
        (await context.telegram
          .getChatMember(chatId, user)
          .catch((err) => console.log(err))) || {};
      leaderboardText += replaceText(text, {
        ...chatUserData.user,
        value: users[index].entry,
        top: index + 1,
      });
    }

    return leaderboardText || "";
  },
};
