async function hasChatPrivate(event: any, chatId: number | string) {
  const getChat = await event.telegram.getChat(chatId).catch(() => null);
  return getChat ? getChat?.type === "private" : false;
}

export { hasChatPrivate };
