import type { AoiClient } from "../AoiClient";

function onEditedChannelPost(telegram: AoiClient) {
  const events = telegram.events.get("editedChannelPost");
  if (!events) return;

  for (const event of events) {
    telegram.on("edited_channel_post", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onEditedChannelPost;
