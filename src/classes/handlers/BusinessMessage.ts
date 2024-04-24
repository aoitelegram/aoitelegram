import type { AoiClient } from "../AoiClient";

function onBusinessMessage(telegram: AoiClient): void {
  const events = telegram.events.get("businessMessage");
  if (!events) return;

  telegram.on("business_message", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onBusinessMessage;
