import type { AoiClient } from "../AoiClient";

function onBusinessMessage(telegram: AoiClient): void {
  telegram.on("business_message", async (ctx) => {
    const events = telegram.events.get("businessMessage");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onBusinessMessage;
