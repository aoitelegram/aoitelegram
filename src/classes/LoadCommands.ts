import fs from "node:fs";
import path from "node:path";
import figlet from "figlet";
import { AoiFunction, ArgsType } from "./AoiFunction";
import { AoijsTypeError } from "./AoiError";
import type { AoiClient } from "./AoiClient";

class LoadCommands {
  public readonly telegram: AoiClient;
  public readonly paths: Set<string> = new Set();

  constructor(telegram: AoiClient) {
    this.telegram = telegram;
    telegram.createCustomFunction(
      new AoiFunction()
        .setName("$updateCommands")
        .setBrackets(true)
        .setFields({
          name: "logger",
          required: false,
          type: [ArgsType.Boolean],
        })
        .onCallback(async (context, func) => {
          const [logger] = await func.resolveFields(context);
          telegram.events.clear();
          telegram.commands.clear();
          for (const path of Array.from(this.paths)) {
            this.loadCommands(path, logger);
          }
          return func.resolve();
        }),
    );
  }

  loadCommands(dirPath: string, logger: boolean = true) {
    if (!dirPath) {
      throw new AoijsTypeError("You did not specify the 'dirPath' parameter");
    }

    this.paths.add(dirPath);
    dirPath = path.join(process.cwd(), dirPath);
    if (!fs.existsSync(dirPath)) {
      throw new AoijsTypeError(
        `The specified file path was not found: ${dirPath}`,
      );
    }

    if (logger) {
      const bigText = figlet.textSync("AoiTelegram");
      console.log(bigText);
    }

    const items = fs.readdirSync(dirPath, { recursive: true });

    for (const itemPath of items) {
      if (typeof itemPath !== "string" || !itemPath.endsWith(".js")) continue;

      const resolvePaths = path.join(dirPath, itemPath);
      delete require.cache[resolvePaths];
      const itemData = require(resolvePaths);
      if (itemData) {
        this.#registerCommand(itemData, resolvePaths, logger);
      }
    }
  }

  #registerCommand(
    itemData: Record<string, any>,
    itemPath: string,
    logger: boolean,
  ): void {
    const requireFun = itemData.default || itemData;
    const requireArray = Array.isArray(requireFun) ? requireFun : [requireFun];

    for (const data of requireArray) {
      if ("command" in data) {
        this.telegram.addCommand(data);
        if (logger) {
          console.log(
            `|---------------------------------------------------------------------|\n`,
            `| Loading in ${itemPath} | Loaded ${data.command} | command |`,
          );
        }
      }

      if ("data" in data) {
        this.telegram.addAction(data);
        if (logger) {
          console.log(
            `|---------------------------------------------------------------------|\n`,
            `| Loading in ${itemPath} | Loaded ${data.data} | action |`,
          );
        }
      }

      if ("awaited" in data) {
        this.telegram.loopCommand(data);
        if (logger) {
          console.log(
            `|---------------------------------------------------------------------|\n`,
            `| Loading in ${itemPath} | Loaded ${data.awaited} | awaited |`,
          );
        }
      }

      if ("type" in data) {
        switch (data.type) {
          case "ready":
            this.telegram.readyCommand(data);
            break;
          case "message":
            this.telegram.messageCommand(data);
            break;
          case "channel_post":
            this.telegram.channelPostCommand(data);
            break;
          case "callback_query":
            this.telegram.callbackQueryCommand(data);
            break;
          case "edited_message":
            this.telegram.editedMessageCommand(data);
            break;
          case "message_reaction":
            this.telegram.messageReactionCommand(data);
            break;
          case "message_reaction_count":
            this.telegram.messageReactionCountCommand(data);
            break;
          case "edited_channel_post":
            this.telegram.editedChannelPostCommand(data);
            break;
          case "inline_query":
            this.telegram.inlineQueryCommand(data);
            break;
          case "shipping_query":
            this.telegram.shippingQueryCommand(data);
            break;
          case "pre_checkout_query":
            this.telegram.preCheckoutQueryCommand(data);
            break;
          case "poll":
            this.telegram.pollCommand(data);
            break;
          case "poll_answer":
            this.telegram.pollAnswerCommand(data);
            break;
          case "chat_member":
            this.telegram.chatMemberCommand(data);
            break;
          case "my_chat_member":
            this.telegram.myChatMemberCommand(data);
            break;
          case "chat_join_request":
            this.telegram.chatJoinRequestCommand(data);
            break;
          case "chat_boost":
            this.telegram.chatBoostCommand(data);
            break;
          case "removed_chat_boost":
            this.telegram.removedChatBoostCommand(data);
            break;
          case "business_connection":
            this.telegram.businessConnectionCommand(data);
            break;
          case "business_message":
            this.telegram.businessMessageCommand(data);
            break;
          case "edited_business_message":
            this.telegram.editedBusinessMessageCommand(data);
            break;
          case "deleted_business_messages":
            this.telegram.deletedBusinessMessagesCommand(data);
            break;
          case "loop":
            this.telegram.loopCommand(data);
            break;
          case "functionError":
            this.telegram.functionErrorCommand(data);
            break;
          default:
            throw new AoijsTypeError(`Event '${data.type}' is not defined`);
        }

        if (logger) {
          console.log(
            `|---------------------------------------------------------------------|\n`,
            `| Loading in ${itemPath} | Loaded ${data.type} | events |`,
          );
        }
      }
    }
  }
}

export { LoadCommands };
