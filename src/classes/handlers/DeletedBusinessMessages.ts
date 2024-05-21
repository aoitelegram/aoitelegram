import type { AoiClient } from "../AoiClient";

function onDeletedBusinessMessages(telegram: AoiClient): void {
  telegram.on("deleted_business_messages", async (ctx) => {
    const events = telegram.events.get("deletedBusinessMessages");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onDeletedBusinessMessages;
