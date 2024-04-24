import type { AoiClient } from "../AoiClient";

function onMessage(telegram: AoiClient): void {
  const events = telegram.events.get("message");
  if (!events) return;

  telegram.on("message", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onMessage;
