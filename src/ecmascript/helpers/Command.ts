import { AoiClient } from "../classes/AoiClient.js";
import { AoijsError } from "../classes/AoiError.js";

interface CommandDescription {
  name: string;
  typeChannel?: false | "private" | "group" | "supergroup" | "channel";
  aliases?: string[];
  code: string;
  useNative?: Function[];
  [key: string]: unknown;
}

/**
 * Class representing a command handler for AoiClient.
 */
class Command {
  /**
   * Array of registered commands.
   */
  commands: CommandDescription[] = [];
  /**
   * Instance of AoiClient used for communication with the Telegram API.
   */
  telegram: AoiClient;

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
    this.commands.push(command);
    return this;
  }

  /**
   * Starts handling incoming messages.
   */
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

        await this.telegram.evaluateCommand(
          commandIdentifier,
          commandDescription.code,
          message,
          commandDescription.useNative,
        );
        break;
      }
    });
  }
}

export { Command, CommandDescription };
