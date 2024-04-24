import type { AoiClient } from "../AoiClient";

function onMyChatMember(telegram: AoiClient): void {
  const events = telegram.events.get("myChatMember");
  if (!events) return;

  telegram.on("my_chat_member", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onMyChatMember;
