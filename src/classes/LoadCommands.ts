import fs from "node:fs";
import path from "node:path";
import figlet from "figlet";
import { AoijsTypeError } from "./AoiError";
import type { AoiClient } from "./AoiClient";

class LoadCommands {
  private path?: string;
  public readonly aoitelegram: AoiClient;

  constructor(aoitelegram: AoiClient) {
    aoitelegram.loadCommands = this;
    this.aoitelegram = aoitelegram;
  }

  loadCommands(dirPath: string, logger: boolean = true) {
    if (!dirPath) {
      throw new AoijsTypeError("You did not specify the 'dirPath' parameter");
    }

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

      const itemData = require(path.join(dirPath, itemPath));
      if (itemData) {
        this.#registerCommand(itemData, path.join(dirPath, itemPath), logger);
      }
    }
  }

  loadVariables(dirPath: string, logger: boolean = true) {
    if (!dirPath) {
      throw new AoijsTypeError("You did not specify the 'dirPath' parameter");
    }

    dirPath = path.join(process.cwd(), dirPath);
    if (!fs.existsSync(dirPath)) {
      throw new AoijsTypeError(
        `The specified file path was not found: ${dirPath}`,
      );
    }

    if (logger) {
      const bigText = figlet.textSync("Variables");
      console.log(bigText);
    }

    const items = fs.readdirSync(dirPath, { recursive: true });

    for (const item of items) {
      if (typeof item !== "string" || !item.endsWith(".js")) continue;

      const itemPath = path.join(dirPath, item);
      const itemData = require(itemPath);

      if (itemData) {
        const requireFun = itemData.default || itemData;

        const isArrayOrEmptyObject =
          (!Array.isArray(requireFun) && typeof requireFun !== "object") ||
          requireFun?.length === 0 ||
          Object.keys(requireFun)?.length === 0;

        if (isArrayOrEmptyObject) {
          throw new AoijsTypeError(
            "To store variables from the loader, specify an array or an object of parameters",
            { path: itemPath },
          );
        }

        const requireArray = Array.isArray(requireFun)
          ? requireFun
          : [requireFun];

        for (const { variables, tables } of requireArray) {
          this.aoitelegram.variables(variables, tables);
        }

        console.log(
          `|---------------------------------------------------------------------|\n`,
          `| Loading in ${itemPath} | Loaded | variables |`,
        );
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
      if ("name" in data) {
        this.aoitelegram.addCommand(data);
        console.log(
          `|---------------------------------------------------------------------|\n`,
          `| Loading in ${itemPath} | Loaded ${data.name} | command |`,
        );
      }

      if ("data" in data) {
        this.aoitelegram.addAction(data);
        console.log(
          `|---------------------------------------------------------------------|\n`,
          `| Loading in ${itemPath} | Loaded ${data.data} | action |`,
        );
      }

      if ("id" in data) {
        this.aoitelegram.timeoutCommand(data);
        console.log(
          `|---------------------------------------------------------------------|\n`,
          `| Loading in ${itemPath} | Loaded ${data.id} | timeout |`,
        );
      }

      if ("awaited" in data) {
        this.aoitelegram.awaitedCommand(data);
        console.log(
          `|---------------------------------------------------------------------|\n`,
          `| Loading in ${itemPath} | Loaded ${data.awaited} | awaited |`,
        );
      }

      if ("type" in data) {
        switch (data.type) {
          case "ready":
            this.aoitelegram.readyCommand(data);
            break;
          case "message":
            this.aoitelegram.messageCommand(data);
            break;
          case "channel_post":
            this.aoitelegram.channelPostCommand(data);
            break;
          case "callback_query":
            this.aoitelegram.callbackQueryCommand(data);
            break;
          case "edited_message":
            this.aoitelegram.editedMessageCommand(data);
            break;
          case "message_reaction":
            this.aoitelegram.messageReactionCommand(data);
            break;
          case "message_reaction_count":
            this.aoitelegram.messageReactionCountCommand(data);
            break;
          case "edited_channel_post":
            this.aoitelegram.editedChannelPostCommand(data);
            break;
          case "inline_query":
            this.aoitelegram.inlineQueryCommand(data);
            break;
          case "shipping_query":
            this.aoitelegram.shippingQueryCommand(data);
            break;
          case "pre_checkout_query":
            this.aoitelegram.preCheckoutQueryCommand(data);
            break;
          case "poll":
            this.aoitelegram.pollCommand(data);
            break;
          case "poll_answer":
            this.aoitelegram.pollAnswerCommand(data);
            break;
          case "chat_member":
            this.aoitelegram.chatMemberCommand(data);
            break;
          case "my_chat_member":
            this.aoitelegram.myChatMemberCommand(data);
            break;
          case "chat_join_request":
            this.aoitelegram.chatJoinRequestCommand(data);
            break;
          case "chat_boost":
            this.aoitelegram.chatBoostCommand(data);
            break;
          case "removed_chat_boost":
            this.aoitelegram.removedChatBoostCommand(data);
            break;
          case "business_connection":
            this.aoitelegram.businessConnectionCommand(data);
            break;
          case "business_message":
            this.aoitelegram.businessMessageCommand(data);
            break;
          case "edited_business_message":
            this.aoitelegram.editedBusinessMessageCommand(data);
            break;
          case "deleted_business_messages":
            this.aoitelegram.deletedBusinessMessagesCommand(data);
            break;
          case "loop":
            this.aoitelegram.loopCommand(data);
            break;
          case "variableCreate":
            this.aoitelegram.variableCreateCommand(data);
            break;
          case "variableUpdate":
            this.aoitelegram.variableUpdateCommand(data);
            break;
          case "variableDelete":
            this.aoitelegram.variableDeleteCommand(data);
            break;
          case "functionError":
            this.aoitelegram.functionErrorCommand(data);
            break;
          default:
            throw new AoijsTypeError(`Event '${data.type}' is not defined`);
        }

        console.log(
          `|---------------------------------------------------------------------|\n`,
          `| Loading in ${itemPath} | Loaded | events |`,
        );
      }
    }
  }
}

export { LoadCommands };
