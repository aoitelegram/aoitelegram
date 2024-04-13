import type { AoiClient } from "../AoiClient";

function onBusinessConnection(telegram: AoiClient) {
  const events = telegram.events.get("businessConnection");
  if (!events) return;

  for (const event of events) {
    telegram.on("business_connection", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onBusinessConnection;
