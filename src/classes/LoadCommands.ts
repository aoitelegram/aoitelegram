import fs from "node:fs";
import path from "node:path";
import figlet from "figlet";
import importSync from "import-sync";
import { AoiClient } from "./AoiClient";
import { AoijsError } from "./AoiError";

class LoadCommands {
  #aoitelegram: AoiClient;
  #countLoadCmd: number = 1;
  #countLoadCallback: number = 1;
  #countLoadVar: number = 1;
  path?: string;

  constructor(aoitelegram: AoiClient) {
    this.#aoitelegram = aoitelegram;
    aoitelegram.loadCommands = this;
  }

  loadCommands(dirPath: string, log: boolean = true, updated: boolean = false) {
    if (!dirPath) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'dirPath' parameter",
      );
    }

    if (this.#countLoadCmd === 1) {
      dirPath = path.join(process.cwd(), dirPath);
      if (log) {
        const bigText = figlet.textSync("AoiTelegram");
        console.log(bigText);
      }
      this.#countLoadCmd = 0;
      this.path = dirPath;
    }

    if (!fs.existsSync(dirPath)) {
      throw new AoijsError(
        "file",
        "the specified file path was not found",
        dirPath,
      );
    }

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        this.loadCommands(itemPath, log, updated);
      } else if (itemPath.endsWith(".js")) {
        const requireFun = importSync(itemPath);
        const dataFunc = requireFun.default || requireFun;

        if (Array.isArray(dataFunc)) {
          for (const dataArrayFunc of dataFunc) {
            if (dataArrayFunc.name) {
              this.#aoitelegram.addCommand({
                name: dataArrayFunc.name,
                aliases: dataArrayFunc.aliases,
                useNative: dataArrayFunc.useNative,
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

            if (dataArrayFunc.data) {
              this.#aoitelegram.addAction({
                data: dataArrayFunc.data,
                answer: dataArrayFunc.answer,
                useNative: dataArrayFunc.useNative,
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
                useNative: dataArrayFunc.useNative,
                code: dataArrayFunc.code,
              });
              if (log) {
                console.log(
                  `|---------------------------------------------------------------------|\n`,
                  `| Loading in ${itemPath} | Loaded '${dataArrayFunc.id}' | timeout |`,
                );
              }
            }

            if (dataArrayFunc.awaited) {
              this.#aoitelegram.awaitedCommand({
                awaited: dataArrayFunc.awaited,
                useNative: dataArrayFunc.useNative,
                code: dataArrayFunc.code,
              });
              if (log) {
                console.log(
                  `|---------------------------------------------------------------------|\n`,
                  `| Loading in ${itemPath} | Loaded '${dataArrayFunc.awaited}' | awaited |`,
                );
              }
            }

            if (dataArrayFunc.type && !updated) {
              const eventType = LoadCommands.loaderEventType(
                dataArrayFunc.type,
              );
              this.runEvent(this.#aoitelegram, eventType, dataArrayFunc);
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
            this.#aoitelegram.addCommand({
              name: dataFunc.name,
              aliases: dataFunc.aliases,
              useNative: dataFunc.useNative,
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

          if (dataFunc.data) {
            this.#aoitelegram.addAction({
              data: dataFunc.data,
              answer: dataFunc.answer,
              useNative: dataFunc.useNative,
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
              useNative: dataFunc.useNative,
              code: dataFunc.code,
            });
            if (log) {
              console.log(
                `|---------------------------------------------------------------------|\n`,
                `| Loading in ${itemPath} | Loaded '${dataFunc.id}' | timeout |`,
              );
            }
          }

          if (dataFunc.awaited) {
            this.#aoitelegram.awaitedCommand({
              awaited: dataFunc.awaited,
              useNative: dataFunc.useNative,
              code: dataFunc.code,
            });
            if (log) {
              console.log(
                `|---------------------------------------------------------------------|\n`,
                `| Loading in ${itemPath} | Loaded '${dataFunc.awaited}' | awaited |`,
              );
            }
          }

          if (dataFunc.type && !updated) {
            const eventType = LoadCommands.loaderEventType(dataFunc.type);
            this.runEvent(this.#aoitelegram, eventType, dataFunc);
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

  loadCallbacks(dirPath: string, log: boolean = true) {
    if (!dirPath) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'dirPath' parameter",
      );
    }

    if (this.#countLoadCallback == 1) {
      dirPath = path.join(process.cwd(), dirPath);
      if (log) {
        const bigText = figlet.textSync("Callbacks");
        console.log(bigText);
      }
      this.#countLoadCallback = 0;
      this.path = dirPath;
    }

    if (!fs.existsSync(dirPath)) {
      throw new AoijsError(
        "file",
        "the specified file path was not found",
        dirPath,
      );
    }

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        this.loadCallbacks(itemPath, log);
      } else if (itemPath.endsWith(".js")) {
        const requireCallbacks = importSync(itemPath);
        const dataCallbacks = requireCallbacks.default || requireCallbacks;

        if (Array.isArray(dataCallbacks)) {
          for (const dataCallbacksArray of dataCallbacks) {
            if (log) {
              console.log(
                `|---------------------------------------------------------------------|\n`,
                `| Loading in ${itemPath} | Loaded '${dataCallbacksArray.name}' | callback |`,
              );
            }
            this.#aoitelegram.addCallback({
              name: dataCallbacksArray.name,
              type: dataCallbacksArray.type,
              useNative: dataCallbacksArray.useNative,
              callback: dataCallbacksArray.callback,
              code: dataCallbacksArray.code,
            });
          }
        } else {
          if (log) {
            console.log(
              `|---------------------------------------------------------------------|\n`,
              `| Loading in ${itemPath} | Loaded '${dataCallbacks.name}' | callback |`,
            );
          }
          this.#aoitelegram.addCallback({
            name: dataCallbacks.name,
            type: dataCallbacks.type,
            useNative: dataCallbacks.useNative,
            callback: dataCallbacks.callback,
            code: dataCallbacks.code,
          });
        }
      }
    }
    return this;
  }

  loadVariables(dirPath: string, log: boolean = true) {
    if (!dirPath) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'dirPath' parameter",
      );
    }

    if (this.#countLoadVar == 1) {
      dirPath = path.join(process.cwd(), dirPath);
      if (log) {
        const bigText = figlet.textSync("Variables");
        console.log(bigText);
      }
      this.#countLoadVar = 0;
      this.path = dirPath;
    }

    if (!fs.existsSync(dirPath)) {
      throw new AoijsError(
        "file",
        "the specified file path was not found",
        dirPath,
      );
    }

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        this.loadVariables(itemPath, log);
      } else if (itemPath.endsWith(".js")) {
        const requireVariables = importSync(itemPath);
        const dataVariables = requireVariables.default || requireVariables;
        if (
          (!Array.isArray(dataVariables) &&
            typeof dataVariables !== "object") ||
          dataVariables?.length === 0 ||
          Object.keys(dataVariables)?.length === 0
        ) {
          throw new AoijsError(
            "parameter",
            "to store variables from the loader, specify an array or an object of parameters",
            itemPath,
          );
        }
        if (Array.isArray(dataVariables)) {
          for (const dataVariablesArray of dataVariables) {
            if (!dataVariablesArray?.variables) {
              throw new AoijsError(
                "parameter",
                "you did not specify the 'variables' parameter",
                itemPath,
              );
            }
            if (log) {
              console.log(
                `|---------------------------------------------------------------------|\n`,
                `| Loading in ${itemPath} | Loaded | variables |`,
              );
            }
            this.#aoitelegram.variables(
              dataVariablesArray.variables,
              dataVariablesArray.tables,
            );
          }
        } else {
          if (!dataVariables?.variables) {
            throw new AoijsError(
              "parameter",
              "you did not specify the 'variables' parameter",
              itemPath,
            );
          }
          if (log) {
            console.log(
              `|---------------------------------------------------------------------|\n`,
              `| Loading in ${itemPath} | Loaded | variables |`,
            );
          }
          this.#aoitelegram.variables(
            dataVariables.variables,
            dataVariables.tables,
          );
        }
      }
    }
    return this;
  }

  runEvent(
    aoitelegram: AoiClient,
    eventType: { hasEvent: string | null; parameter: string },
    data: { every?: number; code: string },
  ) {
    switch (eventType.hasEvent) {
      case "ready":
        aoitelegram.readyCommand(data);
        break;
      case "message":
        aoitelegram.messageCommand(data);
        break;
      case "callback_query":
        aoitelegram.callbackQueryCommand(data);
        break;
      case "edited_message":
        aoitelegram.editedMessageCommand(data);
        break;
      case "message_reaction":
        aoitelegram.messageReactionCommand(data);
        break;
      case "message_reaction_count":
        aoitelegram.messageReactionCountCommand(data);
        break;
      case "channel_post":
        aoitelegram.channelPostCommand(data);
        break;
      case "edited_channel_post":
        aoitelegram.editedChannelPostCommand(data);
        break;
      case "inline_query":
        aoitelegram.inlineQueryCommand(data);
        break;
      case "shipping_query":
        aoitelegram.shippingQueryCommand(data);
        break;
      case "pre_checkout_query":
        aoitelegram.preCheckoutQueryCommand(data);
        break;
      case "poll":
        aoitelegram.pollCommand(data);
        break;
      case "poll_answer":
        aoitelegram.pollAnswerCommand(data);
        break;
      case "chat_member":
        aoitelegram.chatMemberCommand(data);
        break;
      case "my_chat_member":
        aoitelegram.myChatMemberCommand(data);
        break;
      case "chat_join_request":
        aoitelegram.chatJoinRequestCommand(data);
        break;
      case "chat_boost":
        aoitelegram.chatBoostCommand(data);
        break;
      case "removed_chat_boost":
        aoitelegram.removedChatBoostCommand(data);
        break;
      case "loop":
        aoitelegram.loopCommand(data);
        break;
      case "variableCreate":
        aoitelegram.variableCreateCommand(data);
        break;
      case "variableUpdate":
        aoitelegram.variableUpdateCommand(data);
        break;
      case "variableDelete":
        aoitelegram.variableDeleteCommand(data);
        break;
      case "functionError":
        aoitelegram.functionErrorCommand(data);
        break;
      default:
        throw new AoijsError(
          "loader",
          `event '${eventType.parameter}' is not defined`,
        );
    }
  }

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
      loop: "loop",
      variableCreate: "variableCreate",
      variableUpdate: "variableUpdate",
      variableDelete: "variableDelete",
      functionError: "functionError",
    };
    return { hasEvent: events[type] || null, parameter: type };
  }
}

export { LoadCommands };
