import type { AoiClient } from "../AoiClient";

function onEditedMessage(telegram: AoiClient): void {
  telegram.on("edited_message", async (ctx) => {
    const events = telegram.events.get("editedMessage");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onEditedMessage;
