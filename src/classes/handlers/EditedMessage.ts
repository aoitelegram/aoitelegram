import type { AoiClient } from "../AoiClient";

function onEditedMessage(telegram: AoiClient) {
  const commands = telegram.commands.get("editedMessage");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("edited_message", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onEditedMessage;
