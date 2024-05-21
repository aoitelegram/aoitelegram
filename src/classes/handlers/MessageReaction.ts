import type { AoiClient } from "../AoiClient";

function onMessageReaction(telegram: AoiClient): void {
  telegram.on("message_reaction", async (ctx) => {
    const events = telegram.events.get("messageReaction");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onMessageReaction;
