import type { AoiClient } from "../AoiClient";

function onDeletedBusinessMessages(telegram: AoiClient): void {
  const events = telegram.events.get("deletedBusinessMessages");
  if (!events) return;

  telegram.on("deleted_business_messages", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onDeletedBusinessMessages;
