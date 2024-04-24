import type { AoiClient } from "../AoiClient";

function onEditedBusinessMessage(telegram: AoiClient): void {
  const events = telegram.events.get("editedBusinessMessage");
  if (!events) return;

  telegram.on("edited_business_message", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onEditedBusinessMessage;
