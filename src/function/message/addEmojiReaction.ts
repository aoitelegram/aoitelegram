import { isValidChat } from "../helpers";

export default {
  name: "$addEmojiReaction",
  callback: async (ctx, event, database, error) => {
    const [
      emoji = "👎",
      is_big = true,
      message_id = event.message_id || event.message?.message_id,
      chatId = event.chat?.id || event.message?.chat.id,
    ] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([emoji, is_big, message_id, chatId], error, [
      "string",
      "boolean",
      "number",
      "number | string",
    ]);
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

    if (!(await isValidChat(event, chatId))) {
      error.customError("Invalid Chat Id", "$addEmojiReaction");
      return;
    }

    if (!onlyEmiji.includes(emoji)) {
      error.customError(
        `Invalid emoji. Only: ${onlyEmiji.join(", ")}`,
        "$addEmojiReaction",
      );
    }

    const result = await event.telegram
      .setMessageReaction({
        chat_id: chatId,
        message_id,
        reaction: [{ type: "emoji", emoji }],
      })
      .catch(() => null);

    if (!result) {
      error.customError("Invalid messageId", "$addEmojiReaction");
    }

    return true;
  },
};
