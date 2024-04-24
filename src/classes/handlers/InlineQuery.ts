import type { AoiClient } from "../AoiClient";

function onInlineQuery(telegram: AoiClient): void {
  const events = telegram.events.get("inlineQuery");
  if (!events) return;

  telegram.on("inline_query", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onInlineQuery;
