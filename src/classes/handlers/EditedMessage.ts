import type { AoiClient } from "../AoiClient";

function onEditedMessage(telegram: AoiClient): void {
  const events = telegram.events.get("editedMessage");
  if (!events) return;

  telegram.on("edited_message", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onEditedMessage;
