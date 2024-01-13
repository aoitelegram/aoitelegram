async function hasChatPrivate(event, chatId) {
  const getChat = await event.telegram.getChat(chatId).catch(() => null);
  return getChat ? getChat?.type === "private" : false;
}

export { hasChatPrivate };
