import type { AoiClient } from "../AoiClient";

function onEditedChannelPost(telegram: AoiClient): void {
  const events = telegram.events.get("editedChannelPost");
  if (!events) return;

  telegram.on("edited_channel_post", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onEditedChannelPost;
