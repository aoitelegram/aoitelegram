import type { AoiClient } from "../AoiClient";

function onMessageReaction(telegram: AoiClient) {
  const events = telegram.events.get("messageReaction");
  if (!events) return;

  for (const event of events) {
    telegram.on("message_reaction", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onMessageReaction;
