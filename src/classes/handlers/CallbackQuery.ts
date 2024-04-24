import type { AoiClient } from "../AoiClient";

function onCallbackQuery(telegram: AoiClient): void {
  const events = telegram.events.get("callbackQuery");
  if (!events) return;

  telegram.on("callback_query", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onCallbackQuery;
