import type { AoiClient } from "../AoiClient";

function onPoll(telegram: AoiClient) {
  const events = telegram.events.get("poll");
  if (!events) return;

  for (const event of events) {
    telegram.on("poll", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onPoll;
