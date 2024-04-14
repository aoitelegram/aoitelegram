import type { AoiClient } from "../AoiClient";

function onMyChatMember(telegram: AoiClient): void {
  const events = telegram.events.get("myChatMember");
  if (!events) return;

  for (const event of events) {
    telegram.on("my_chat_member", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onMyChatMember;
