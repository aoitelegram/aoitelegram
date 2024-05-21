import type { AoiClient } from "../AoiClient";

function onBusinessConnection(telegram: AoiClient): void {
  telegram.on("business_connection", async (ctx) => {
    const events = telegram.events.get("businessConnection");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onBusinessConnection;
