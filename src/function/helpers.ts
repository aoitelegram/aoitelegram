async function hasValidChat(event, chatId) {
  const getChat = await event.telegram.getChat(chatId).catch(() => null);
  return getChat ? getChat?.type !== "private" : false;
}

async function hasChatPrivate(event, chatId) {
  const getChat = await event.telegram.getChat(chatId).catch(() => null);
  return getChat ? getChat?.type === "private" : false;
}

async function isValidChat(event, chatId) {
  const getChat = await event.telegram.getChat(chatId).catch(() => null);
  return getChat ? true : false;
}

export { hasValidChat, hasChatPrivate, isValidChat };
