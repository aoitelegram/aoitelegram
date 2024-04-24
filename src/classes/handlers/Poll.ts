import type { AoiClient } from "../AoiClient";

function onPoll(telegram: AoiClient): void {
  const events = telegram.events.get("poll");
  if (!events) return;

  telegram.on("poll", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onPoll;
