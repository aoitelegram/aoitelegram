import type { AoiClient } from "../AoiClient";

function onChannelPost(telegram: AoiClient) {
  const commands = telegram.commands.get("channelPost");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("channel_post", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onChannelPost;
