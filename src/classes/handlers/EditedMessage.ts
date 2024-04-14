import type { AoiClient } from "../AoiClient";

function onEditedMessage(telegram: AoiClient): void {
  const events = telegram.events.get("editedMessage");
  if (!events) return;

  for (const event of events) {
    telegram.on("edited_message", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onEditedMessage;
