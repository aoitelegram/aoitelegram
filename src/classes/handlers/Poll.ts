import type { AoiClient } from "../AoiClient";

function onPoll(telegram: AoiClient): void {
  telegram.on("poll", async (ctx) => {
    const events = telegram.events.get("poll");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onPoll;
