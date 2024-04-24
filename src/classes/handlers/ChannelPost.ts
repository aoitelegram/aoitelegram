import type { AoiClient } from "../AoiClient";

function onChannelPost(telegram: AoiClient): void {
  const events = telegram.events.get("channelPost");
  if (!events) return;

  telegram.on("channel_post", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onChannelPost;
