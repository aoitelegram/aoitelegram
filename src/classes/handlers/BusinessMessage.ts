import type { AoiClient } from "../AoiClient";

function onBusinessMessage(telegram: AoiClient) {
  const events = telegram.events.get("businessMessage");
  if (!events) return;

  for (const event of events) {
    telegram.on("business_message", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onBusinessMessage;
