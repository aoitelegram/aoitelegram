import type { AoiClient } from "../AoiClient";

function onCallbackQuery(telegram: AoiClient): void {
  telegram.on("callback_query", async (ctx) => {
    const events = telegram.events.get("callbackQuery");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onCallbackQuery;
