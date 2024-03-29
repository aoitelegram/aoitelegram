import type { AoiClient } from "../AoiClient";

async function onReady(telegram: AoiClient) {
  const commands = telegram.commands.get("ready");
  if (!commands) return;

  for (const command of commands) {
    await telegram.evaluateCommand(command, telegram);
  }
}

export default onReady;
