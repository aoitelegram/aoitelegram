import type { AoiClient } from "../AoiClient";

function onMessageReactionCount(telegram: AoiClient): void {
  telegram.on("message_reaction_count", async (ctx) => {
    const events = telegram.events.get("messageReactionCount");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onMessageReactionCount;
