import { AoiClient } from "../classes/AoiClient";

interface CommandDescription {
  name: string;
  typeChannel?:
    | false
    | "private"
    | "group"
    | "supergroup"
    | "channel"
    | undefined;
  aliases?: string[];
  code: string;
}

/**
 * Class representing a command handler for AoiClient.
 */
class Command {
  /**
   * Array of registered commands.
   * @private
   */
  private commands: CommandDescription[] = [];
  /**
   * Instance of AoiClient used for communication with the Telegram API.
   * @private
   */
  private telegram: AoiClient;

  /**
   * Creates a new instance of CommandHandler.
   * @param telegram Instance of AoiClient used for communication with the Telegram API.
   */
  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  /**
   * Registers a new command.
   * @param command Command description object.
   * @returns This CommandHandler instance for method chaining.
   */
  register(command: CommandDescription) {
    const existingIndex = this.commands.findIndex(
      (map) => map.name === command.name,
    );
    if (existingIndex !== -1) {
      this.commands[existingIndex] = command;
    } else {
      this.commands.push(command);
    }
    return this;
  }

  /**
   * Starts handling incoming messages.
   */
  handler() {
    this.telegram.on("message:text", (message) => {
      const messageArgs = message.text.split(/\s+/);
      const commandIdentifier = messageArgs[0];

      if (!message.chat || !this.commands.length) return;

      const filteredCommands = this.commands.filter(
        (command) =>
          !command.typeChannel || command.typeChannel === message.chat.type,
      );

      for (const command of filteredCommands) {
        const aliasesRegex = new RegExp(
          `^/(?:${(command.aliases || []).join("|")})$`,
        );
        if (
          !aliasesRegex.test(commandIdentifier) &&
          `/${command.name}` !== commandIdentifier
        )
          continue;

        this.telegram.evaluateCommand(commandIdentifier, command.code, message);
        break;
      }
    });
  }
}

export { Command, CommandDescription };
