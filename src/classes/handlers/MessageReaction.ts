import type { AoiClient } from "../AoiClient";

function onMessageReaction(telegram: AoiClient): void {
  const events = telegram.events.get("messageReaction");
  if (!events) return;

  telegram.on("message_reaction", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onMessageReaction;
