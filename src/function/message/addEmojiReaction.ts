export default {
  name: "$addEmojiReaction",
  callback: async (context) => {
    const [
      emoji = "👎",
      is_big = true,
      message_id = context.event.message_id ||
        context.event.message?.message_id,
      chatId = context.event.chat?.id || context.event.message?.chat.id,
    ] = context.splits;
    context.checkArgumentTypes([
      "string",
      "boolean | undefined",
      "number | undefined",
      "number | string | undefined",
    ]);
    if (context.isError) return;

    const onlyEmiji = [
      "👍",
      "👎",
      "❤",
      "🔥",
      "🥰",
      "👏",
      "😁",
      "🤔",
      "🤯",
      "😱",
      "🤬",
      "😢",
      "🎉",
      "🤩",
      "🤮",
      "💩",
      "🙏",
      "👌",
      "🕊",
      "🤡",
      "🥱",
      "🥴",
      "😍",
      "🐳",
      "❤‍🔥",
      "🌚",
      "🌭",
      "💯",
      "🤣",
      "⚡",
      "🍌",
      "🏆",
      "💔",
      "🤨",
      "😐",
      "🍓",
      "🍾",
      "💋",
      "🖕",
      "😈",
      "😴",
      "😭",
      "🤓",
      "👻",
      "👨‍💻",
      "👀",
      "🎃",
      "🙈",
      "😇",
      "😨",
      "🤝",
      "✍",
      "🤗",
      "🫡",
      "🎅",
      "🎄",
      "☃",
      "💅",
      "🤪",
      "🗿",
      "🆒",
      "💘",
      "🙉",
      "🦄",
      "😘",
      "💊",
      "🙊",
      "😎",
      "👾",
      "🤷‍♂",
      "🤷",
      "🤷‍♀",
      "😡",
    ];

    if (!onlyEmiji.includes(emoji)) {
      context.sendError(`Invalid emoji. Only: ${onlyEmiji.join(", ")}`);
      return;
    }

    await context.telegram.setMessageReaction({
      chat_id: chatId,
      message_id,
      reaction: [{ type: "emoji", emoji }],
    });

    return true;
  },
};
