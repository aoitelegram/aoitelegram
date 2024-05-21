import type { AoiClient } from "../../AoiClient";

function onCommand(telegram: AoiClient): void {
  telegram.on("message:text", async (ctx) => {
    const commands = telegram.commands.get("command");
    if (!commands) return;

    const cmdMessage = ctx.entities.botCommand;
    if (!cmdMessage || cmdMessage.length === 0) return;

    const cmdName = cmdMessage[0].search;
    if (!cmdName) return;

    const botUsername = ctx.api.botInfo.username;

    for (const cmd of commands) {
      if (!("name" in cmd)) continue;
      const cmdAlias = `/${cmd.name}`;
      const cmdAliasWithUsername = `/${cmd.name}@${botUsername}`;

      if (
        cmdName !== cmdAlias &&
        cmdName !== cmdAliasWithUsername &&
        !(
          cmd.aliases?.find((name) => name === cmdAlias) ||
          cmd.aliases?.find((name) => name === cmdAliasWithUsername)
        )
      )
        continue;

      await telegram.evaluateCommand(cmd, ctx);
    }
  });
}

export default onCommand;
