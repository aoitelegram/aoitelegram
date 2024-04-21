import type { AoiClient } from "../../AoiClient";

interface ICommandDescription {
  name: string;
  code: string;
  aliases?: string[];
  description?: string;
  chatId?: number | string;
  reverseReading?: boolean;
}

function onCommand(telegram: AoiClient): void {
  const commands = telegram.commands.get("command");
  if (!commands) return;

  telegram.on("message:text", async (ctx) => {
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
export { ICommandDescription };
