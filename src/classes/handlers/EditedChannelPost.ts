import type { AoiClient } from "../AoiClient";

function onEditedChannelPost(telegram: AoiClient) {
  const commands = telegram.commands.get("editedChannelPost");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("edited_channel_post", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onEditedChannelPost;
