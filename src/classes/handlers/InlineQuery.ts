import type { AoiClient } from "../AoiClient";

function onInlineQuery(telegram: AoiClient): void {
  const events = telegram.events.get("inlineQuery");
  if (!events) return;

  for (const event of events) {
    telegram.on("inline_query", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onInlineQuery;
