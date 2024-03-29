import type { AoiClient } from "../AoiClient";

function onPollAnswer(telegram: AoiClient) {
  const commands = telegram.commands.get("pollAnswer");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("poll_answer", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onPollAnswer;
