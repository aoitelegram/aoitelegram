import type { AoiClient } from "../AoiClient";

function onBusinessConnection(telegram: AoiClient): void {
  const events = telegram.events.get("businessConnection");
  if (!events) return;

  telegram.on("business_connection", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onBusinessConnection;
