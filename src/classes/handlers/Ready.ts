import type { AoiClient } from "../AoiClient";

function onReady(telegram: AoiClient) {
  const commandsReady = telegram.commands.get("ready");
  if (!commandsReady) return;

  telegram.on("onStart", async () => {
    for (const command of commandsReady) {
      await telegram.evaluateCommand({}, command.code, telegram, []);
    }
  });
}

export default onReady;
