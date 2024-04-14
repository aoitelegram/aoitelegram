import type { AoiClient } from "../AoiClient";

function onMessage(telegram: AoiClient): void {
  const events = telegram.events.get("message");
  if (!events) return;

  for (const event of events) {
    telegram.on("message", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onMessage;
