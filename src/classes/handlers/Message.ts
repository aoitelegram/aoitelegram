import type { AoiClient } from "../AoiClient";

function onMessage(telegram: AoiClient): void {
  telegram.on("message", async (ctx) => {
    const events = telegram.events.get("message");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onMessage;
