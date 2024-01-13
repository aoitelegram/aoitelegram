import ms from "ms";

export default {
  name: "$deleteIn",
  callback: async (context) => {
    context.argsCheck(1);
    const [
      time,
      messageId = context.event.message_id || context.event.message?.message_id,
    ] = context.splits;
    if (context.isError) return;

    const chatId = context.event.chat.id || context.event.message?.chat.id;

    setTimeout(async () => {
      await context.event
        .deleteMessage(messageId)
        .catch((err) => console.log(err));
    }, +ms(time));
    return "";
  },
};
