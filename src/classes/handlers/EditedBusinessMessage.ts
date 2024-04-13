import type { AoiClient } from "../AoiClient";

function onEditedBusinessMessage(telegram: AoiClient) {
  const events = telegram.events.get("editedBusinessMessage");
  if (!events) return;

  for (const event of events) {
    telegram.on("edited_business_message", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onEditedBusinessMessage;
