import type { AoiClient } from "../AoiClient";

function onPollAnswer(telegram: AoiClient): void {
  const events = telegram.events.get("pollAnswer");
  if (!events) return;

  telegram.on("poll_answer", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onPollAnswer;
