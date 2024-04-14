import type { AoiClient } from "../AoiClient";

function onChannelPost(telegram: AoiClient): void {
  const events = telegram.events.get("channelPost");
  if (!events) return;

  for (const event of events) {
    telegram.on("channel_post", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onChannelPost;
