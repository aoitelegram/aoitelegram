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
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$userLeaderBoard");

    const args = await ctx.getEvaluateArgs();
    const userId = event.from?.id || event.message?.from?.id;
    const chatId = args[0] || event.chat?.id || event.message?.chat.id;
    const defaultTable = args[5] || database.tables[0];

    ctx.checkArgumentTypes(args, error, [
      "number | string | undefined",
      "string",
      "string | undefined",
      "string | undefined",
      "number | undefined",
      "number | undefined",
      "string | undefined",
    ]);

    let leaderboardText = "";
    let users: UsersData[] = [];
    const allEntries = await database.all(defaultTable);

    for (const entryKey in allEntries) {
      const entryValue = await database.get(defaultTable, entryKey);
      const [, userId] = entryKey.split("_");
      if (`user_${userId}_${chatId}_${args[1]}` !== entryKey) continue;

      if (!isNaN(Number(entryValue))) {
        users.push({ entry: Number(entryValue), user: entryKey });
      } else continue;
    }

    if (args[2] === "asc" || !args[2]) {
      users.sort((a, b) => Number(b.entry) - Number(a.entry));
    } else if (args[2] === "dsc") {
      users.sort((a, b) => Number(a.entry) - Number(b.entry));
    }

    for (let index = 0; index < users.length; index++) {
      if (index + 1 === Number(args[4] || 10)) break;
      const [, user] = users[index].user.split("_");
      const chatUserData = await event.getChatMember(user);
      leaderboardText += replaceText(args[3], {
        ...chatUserData.user,
        value: users[index].entry,
        top: index + 1,
      });
    }

    return leaderboardText || undefined;
  },
};
