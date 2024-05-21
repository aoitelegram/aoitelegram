import type { AoiClient } from "../AoiClient";

function onChannelPost(telegram: AoiClient): void {
  telegram.on("channel_post", async (ctx) => {
    const events = telegram.events.get("channelPost");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onChannelPost;
