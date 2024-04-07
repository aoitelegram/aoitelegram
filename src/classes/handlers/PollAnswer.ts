import type { AoiClient } from "../AoiClient";

function onPollAnswer(telegram: AoiClient) {
  const events = telegram.events.get("pollAnswer");
  if (!events) return;

  for (const event of events) {
    telegram.on("poll_answer", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onPollAnswer;
