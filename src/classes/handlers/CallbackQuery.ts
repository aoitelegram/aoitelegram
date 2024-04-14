import type { AoiClient } from "../AoiClient";

function onCallbackQuery(telegram: AoiClient): void {
  const events = telegram.events.get("callbackQuery");
  if (!events) return;

  for (const event of events) {
    telegram.on("callback_query", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onCallbackQuery;
