import fs from "node:fs";
import path from "node:path";
import figlet from "figlet";
import { AoiClient } from "./AoiClient";
import { AoijsError } from "./AoiError";

/**
 * Class to load and process commands for AoiTelegram.
 */
class LoadCommands {
  #aoitelegram: AoiClient;
  #count: number = 1;
  /**
   * Constructor for LoadCommands.
   * @param {AoiClient} aoitelegram - The AoiClient instance to load commands into.
   */
  constructor(aoitelegram: AoiClient) {
    this.#aoitelegram = aoitelegram;
  }

  /**
   * Asynchronously loads commands from the specified directory path.
   * @param {string} dirPath - The directory path from which to load commands.
   * @param {boolean} [log] - The console load commands.
   */
  async loadCommands(dirPath: string, log: boolean = true) {
    if (!dirPath) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'dirPath' parameter",
      );
    }
    if (this.#count === 1) {
      dirPath = path.join(process.cwd(), dirPath);
      if (log) {
        const bigText = figlet.textSync("AoiTelegram");
        console.log(bigText);
      }
      this.#count = 0;
    }

    if (!fs.existsSync(dirPath)) {
      throw new AoijsError(
        "file",
        "the specified file path was not found",
        dirPath,
      );
    }

    const items = await fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        this.loadCommands(itemPath, log);
      } else if (itemPath.endsWith(".js")) {
        const requireFun = require(itemPath);
        const dataFunc = requireFun.default || requireFun;

        if (Array.isArray(dataFunc)) {
          for (const dataArrayFunc of dataFunc) {
            if (dataArrayFunc.name) {
              this.#aoitelegram.command({
                name: dataArrayFunc.name,
                aliases: dataArrayFunc.aliases,
                typeChannel: dataArrayFunc.typeChannel,
                code: dataArrayFunc.code,
              });
              if (log) {
                console.log(
                  `|---------------------------------------------------------------------|\n`,
                  `| Loading in ${itemPath} | Loaded '${dataArrayFunc.name}' | command |`,
                );
              }
            }

            if (dataArrayFunc.action) {
              this.#aoitelegram.action({
                data: dataArrayFunc.data,
                answer: dataArrayFunc.answer,
                code: dataArrayFunc.code,
              });
              if (log) {
                console.log(
                  `|---------------------------------------------------------------------|\n`,
                  `| Loading in ${itemPath} | Loaded '${dataArrayFunc.data}' | action |`,
                );
              }
            }

            if (dataArrayFunc.id) {
              this.#aoitelegram.timeoutCommand({
                id: dataArrayFunc.id,
                code: dataArrayFunc.code,
              });
              if (log) {
                console.log(
                  `|---------------------------------------------------------------------|\n`,
                  `| Loading in ${itemPath} | Loaded '${dataArrayFunc.id}' | timeout |`,
                );
              }
            }

            if (dataArrayFunc.type) {
              const eventType = LoadCommands.loaderEventType(
                dataArrayFunc.type,
              );
              await this.runEvent(this.#aoitelegram, eventType, dataArrayFunc);
              if (log) {
                console.log(
                  `|---------------------------------------------------------------------|\n`,
                  `| Loading in ${itemPath} | Loaded '${dataArrayFunc.type}' | event |`,
                );
              }
            }
          }
        } else {
          if (dataFunc.name) {
            this.#aoitelegram.command({
              name: dataFunc.name,
              aliases: dataFunc.aliases,
              typeChannel: dataFunc.typeChannel,
              code: dataFunc.code,
            });
            if (log) {
              console.log(
                `|---------------------------------------------------------------------|\n`,
                `| Loading in ${itemPath} | Loaded '${dataFunc.name}' | command |`,
              );
            }
          }

          if (dataFunc.action) {
            this.#aoitelegram.action({
              data: dataFunc.data,
              answer: dataFunc.answer,
              code: dataFunc.code,
            });
            if (log) {
              console.log(
                `|---------------------------------------------------------------------|\n`,
                `| Loading in ${itemPath} | Loaded '${dataFunc.data}' | action |`,
              );
            }
          }

          if (dataFunc.id) {
            this.#aoitelegram.timeoutCommand({
              id: dataFunc.id,
              code: dataFunc.code,
            });
            if (log) {
              console.log(
                `|---------------------------------------------------------------------|\n`,
                `| Loading in ${itemPath} | Loaded '${dataFunc.id}' | timeout |`,
              );
            }
          }

          if (dataFunc.type) {
            const eventType = LoadCommands.loaderEventType(dataFunc.type);
            await this.runEvent(this.#aoitelegram, eventType, dataFunc);
            if (log) {
              console.log(
                `|---------------------------------------------------------------------|\n`,
                `| Loading in ${itemPath} | Loaded '${dataFunc.type}' | event |`,
              );
            }
          }
        }
      }
    }
    return this;
  }

  /**
   * Run an event based on its type.
   *
   * @param {AoiClient} aoitelegram - The AoiClient instance to handle the event.
   * @param {{ hasEvent: string | null; parameter: string }} eventType - The event type to be processed, including 'hasEvent' and 'parameter' properties.
   * @param {{ code: string }} data - The data associated with the event, containing a 'code' property.
   */
  runEvent(
    aoitelegram: AoiClient,
    eventType: { hasEvent: string | null; parameter: string },
    data: { code: string },
  ) {
    switch (true) {
      case "ready" === eventType.hasEvent:
        aoitelegram.readyCommand(data);
        break;
      case "message" === eventType.hasEvent:
        aoitelegram.messageCommand(data);
        break;
      case "callback_query" === eventType.hasEvent:
        aoitelegram.callbackQueryCommand(data);
        break;
      case "edited_message" === eventType.hasEvent:
        aoitelegram.editedMessageCommand(data);
        break;
      case "channel_post" === eventType.hasEvent:
        aoitelegram.channelPostCommand(data);
        break;
      case "edited_channel_post" === eventType.hasEvent:
        aoitelegram.editedChannelPostCommand(data);
        break;
      case "inline_query" === eventType.hasEvent:
        aoitelegram.inlineQueryCommand(data);
        break;
      case "shipping_query" === eventType.hasEvent:
        aoitelegram.shippingQueryCommand(data);
        break;
      case "pre_checkout_query" === eventType.hasEvent:
        aoitelegram.preCheckoutQueryCommand(data);
        break;
      case "poll" === eventType.hasEvent:
        aoitelegram.pollCommand(data);
        break;
      case "poll_answer" === eventType.hasEvent:
        aoitelegram.pollAnswerCommand(data);
        break;
      case "chat_member" === eventType.hasEvent:
        aoitelegram.chatMemberCommand(data);
        break;
      case "my_chat_member" === eventType.hasEvent:
        aoitelegram.myChatMemberCommand(data);
        break;
      case "chat_join_request" === eventType.hasEvent:
        aoitelegram.chatJoinRequestCommand(data);
        break;
      default:
        throw new AoijsError(
          "loader",
          `event '${eventType.parameter}' is not defined`,
        );
    }
  }

  /**
   * Get the loader event type based on a given type string.
   *
   * @param {string} type - The type of the event.
   * @returns {{ hasEvent: string | null; parameter: string }} - An object with 'hasEvent' and 'parameter' properties representing the event type.
   */
  static loaderEventType(type: string) {
    const events: { [key: string]: string } = {
      ready: "ready",
      message: "message",
      callback_query: "callback_query",
      edited_message: "edited_message",
      channel_post: "channel_post",
      edited_channel_post: "edited_channel_post",
      inline_query: "inline_query",
      shipping_query: "shipping_query",
      pre_checkout_query: "pre_checkout_query",
      poll: "poll",
      poll_answer: "poll_answer",
      chat_member: "chat_member",
      my_chat_member: "my_chat_member",
      chat_join_request: "chat_join_request",
    };
    return { hasEvent: events[type] ?? null, parameter: type };
  }
}

export { LoadCommands };
