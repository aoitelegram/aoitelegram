import { AoiClient } from "../classes/AoiClient";
import { AoijsError } from "../classes/AoiError";
import type { ICommandsOptions } from "../classes/AoiBase";

type CommandDescription = Pick<ICommandsOptions, "typeChannel" | "aliases">;

class Command {
  commands: CommandDescription[] = [];
  telegram: AoiClient;

  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  register(command: CommandDescription) {
    this.commands.push(command);
    return this;
  }

  handler() {
    this.telegram.on("message:text", async (message) => {
      const messageArgs = message.text.split(/\s+/);
      const commandIdentifier = messageArgs[0];

      if (!message.chat || !this.commands.length) return;

      const filteredCommands = this.commands.filter(
        (command) =>
          !command.typeChannel || command.typeChannel === message.chat.type,
      );

      for (const commandDescription of filteredCommands) {
        const aliasesRegex = new RegExp(
          `^/(?:${(commandDescription.aliases || []).join("|")})$`,
        );
        if (
          !aliasesRegex.test(commandIdentifier) &&
          `/${commandDescription.name}` !== commandIdentifier
        )
          continue;

        await this.telegram.evaluateCommand(commandDescription, message);
        break;
      }
    });
  }
}

export { Command, CommandDescription };
