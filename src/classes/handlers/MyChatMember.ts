import type { AoiClient } from "../AoiClient";

function onMyChatMember(telegram: AoiClient): void {
  telegram.on("my_chat_member", async (ctx) => {
    const events = telegram.events.get("myChatMember");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onMyChatMember;
