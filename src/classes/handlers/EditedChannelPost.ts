import type { AoiClient } from "../AoiClient";

function onEditedChannelPost(telegram: AoiClient): void {
  telegram.on("edited_channel_post", async (ctx) => {
    const events = telegram.events.get("editedChannelPost");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onEditedChannelPost;
