import type { AoiClient } from "../AoiClient";

function onPollAnswer(telegram: AoiClient): void {
  telegram.on("poll_answer", async (ctx) => {
    const events = telegram.events.get("pollAnswer");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onPollAnswer;
