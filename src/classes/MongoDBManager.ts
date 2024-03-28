import ms from "ms";
import { AoiBase } from "./AoiBase";
import { AoiLogger } from "./AoiLogger";
import { Collection } from "telegramsjs";
import { AoijsError } from "./AoiError";
import { hasChatPrivate } from "../function/helpers";
import { formatTime, replaceData } from "../function/parser";
import { MongoDBManager as MongoDB } from "@aoitelegram/database";

interface ChatData {
  top: number;
  id: number;
  title: string;
  type: string;
  value: unknown;
  description: string;
  invite_link: string;
}

interface ChatsData {
  entry: number;
  chat: string;
}

function replaceText(text: string, chatData: ChatData) {
  return text
    .replace(/{top}/g, `${chatData.top}`)
    .replace(/{id}/g, `${chatData.id}`)
    .replace(/{type}/g, `${chatData.type}`)
    .replace(/{title}/g, `${chatData.title}`)
    .replace(/{description}/g, `${chatData.description}`)
    .replace(/{invite_link}/g, `${chatData.invite_link}`)
    .replace(/{value}/g, `${chatData.value}`);
}

interface ChatDataUsers {
  top: number;
  id: number;
  first_name: string;
  username: string;
  type: string;
  value: unknown;
  last_name?: string;
  language_code?: string;
  bio?: string;
}

interface UsersData {
  entry: number;
  user: string;
}

function replaceTextUsers(text: string, chatData: ChatDataUsers) {
  return text
    .replace(/{top}/g, `${chatData.top}`)
    .replace(/{id}/g, `${chatData.id}`)
    .replace(/{first_name}/g, `${chatData.first_name}`)
    .replace(/{last_name}/g, `${chatData.last_name}`)
    .replace(/{language_code}/g, `${chatData.language_code}`)
    .replace(/{username}/g, `${chatData.username}`)
    .replace(/{type}/g, `${chatData.type}`)
    .replace(/{value}/g, `${chatData.value}`)
    .replace(/{bio}/g, `${chatData.bio}`);
}

interface MongoDBManagerOptions {
  url?: string;
  tables?: string[];
  logging?: boolean;
}

class MongoDBManager extends MongoDB<string, unknown> {
  collection: Collection<string, unknown> = new Collection();
  tables: string[] = ["main"];

  constructor(options: MongoDBManagerOptions = {}) {
    if (!options?.url) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'url' parameter",
      );
    }

    super(options.url);
    if (options.logging === undefined || options.logging) {
      this.on("ready", async () => {
        AoiLogger.info("MongoDB has been established");
      });
    }
    this.tables = options.tables || ["main"];
  }

  createFunction(aoitelegram: AoiBase) {
    aoitelegram.editFunction([
      {
        name: "$chatCooldown",
        callback: async (context: any) => {
          context.argsCheck(1);
          const [time, textError, defaultTable = context.database.tables[0]] =
            context.splits;
          const chatId =
            context.event.chat?.id || context.event.message?.chat.id;
          context.checkArgumentTypes([
            "string",
            "string | undefined",
            "string | undefined",
          ]);
          if (context.isError) return;

          const cooldownKey = `cooldown_${chatId}_${ms(time)}`;
          const userCooldown =
            (await context.database.get(defaultTable, cooldownKey)) || 0;
          const cooldown = userCooldown + +ms(time) - Date.now();
          if (cooldown > 0) {
            if (textError) {
              if (context.replyMessage)
                context.sendError(
                  replaceData(formatTime(cooldown).units, textError),
                );
            } else context.isError = true;
          } else {
            await context.database.set(defaultTable, cooldownKey, Date.now());
          }
        },
      },
      {
        name: "$chatLeaderBoard",
        callback: async (context: any) => {
          context.argsCheck(1);

          const [
            variable,
            type = "asc",
            text = "{top}. {title} - {value}",
            maxUser = 10,
            defaultTable = context.database.tables[0],
          ] = context.splits;

          context.checkArgumentTypes([
            "string",
            "string | undefined",
            "string | undefined",
            "number | undefined",
            "number | undefined",
            "string | undefined",
          ]);

          if (context.isError) return;

          let leaderboardText = "";
          let chats: ChatsData[] = [];
          const allEntries = await context.database.all(defaultTable);

          for (const entryKey in allEntries) {
            const entryValue = await context.database.get(
              defaultTable,
              entryKey,
            );
            const [, chatId] = entryKey.split("_");
            if (`chat_${chatId}_${variable}` !== entryKey) continue;

            if (!isNaN(Number(entryValue))) {
              chats.push({ entry: Number(entryValue), chat: entryKey });
            } else continue;
          }

          if (type === "asc") {
            chats.sort((a, b) => Number(b.entry) - Number(a.entry));
          } else if (type === "dsc") {
            chats.sort((a, b) => Number(a.entry) - Number(b.entry));
          }

          for (let index = 0; index < chats.length; index++) {
            if (index + 1 === Number(maxUser)) break;
            const [, chat] = chats[index].chat.split("_");
            const chatUserData = await context.event.getChat(chat);
            leaderboardText += replaceText(text, {
              ...chatUserData,
              value: chats[index].entry,
              top: index + 1,
            });
          }

          return leaderboardText || undefined;
        },
      },
      {
        name: "$cooldown",
        callback: async (context: any) => {
          context.argsCheck(1);
          const [time, textError, defaultTable = context.database.tables[0]] =
            context.splits;
          const userId =
            context.event.from?.id || context.event.message?.from.id;
          const chatId =
            context.event.chat?.id || context.event.message?.chat.id;
          context.checkArgumentTypes([
            "string",
            "string | undefined",
            "string | undefined",
          ]);

          if (context.isError) return;

          const cooldownKey = `cooldown_${userId}_${chatId}_${ms(time)}`;
          const userCooldown =
            (await context.database.get(defaultTable, cooldownKey)) || 0;
          const cooldown = userCooldown + +ms(time) - Date.now();
          if (cooldown > 0) {
            if (textError) {
              context.sendError(
                replaceData(formatTime(cooldown).units, textError),
                true,
              );
            } else context.isError = true;
          } else {
            await context.database.set(defaultTable, cooldownKey, Date.now());
          }
        },
      },
      {
        name: "$deleteVar",
        callback: async (context: any) => {
          context.argsCheck(1);
          context.checkArgumentTypes([
            "unknown",
            "boolean | undefined",
            "string | undefined",
          ]);
          if (context.isError) return;

          const [
            variable,
            returnValue = false,
            defaultTable = context.database.tables[0],
          ] = context.splits;

          if (!(await context.database.hasTable(defaultTable))) {
            context.sendError(`Invalid table ${defaultTable} not found`);
            return;
          }

          return await context.database.delete(
            defaultTable,
            variable,
            returnValue,
          );
        },
      },
      {
        name: "$getChatVar",
        callback: async (context: any) => {
          context.argsCheck(1);
          const [
            variable,
            chatId = context.event.chat?.id || context.event.message?.chat.id,
            defaultTable = context.database.tables[0],
          ] = context.splits;

          context.checkArgumentTypes([
            "string",
            "string | number",
            "string | undefined",
          ]);

          if (context.isError) return;

          if (!(await context.database.has(defaultTable, variable))) {
            context.sendError(`Invalid variable ${variable} not found`);
            return;
          }

          return await context.database.get(
            defaultTable,
            `chat_${chatId}_${variable}`,
          );
        },
      },
      {
        name: "$getMessageVar",
        callback: async (context: any) => {
          context.argsCheck(1);
          const [
            variable,
            messageId = context.event.message_id ||
              context.event.message?.message_id,
            defaultTable = context.database.tables[0],
          ] = context.splits;

          const chatId =
            context.event.chat?.id || context.event.message?.chat.id;

          context.checkArgumentTypes([
            "string",
            "string | number | undefined",
            "string | undefined",
          ]);

          if (context.isError) return;

          if (!(await context.database.has(defaultTable, variable))) {
            context.sendError(`Invalid variable ${variable} not found`);
            return;
          }

          return await context.database.get(
            defaultTable,
            `message_${messageId}_${chatId}_${variable}`,
          );
        },
      },
      {
        name: "$getUserVar",
        callback: async (context: any) => {
          context.argsCheck(1);
          const [
            variable,
            userId = context.event.from?.id || context.event.message?.from.id,
            defaultTable = context.database.tables[0],
          ] = context.splits;

          const chatId =
            context.event.chat?.id || context.event.message?.chat.id;

          context.checkArgumentTypes([
            "string",
            "string | number | undefined",
            "string | undefined",
          ]);

          if (context.isError) return;

          if (!(await context.database.has(defaultTable, variable))) {
            context.sendError(`Invalid variable ${variable} not found`);
            return;
          }

          if (!(await hasChatPrivate(context.event, userId))) {
            context.sendError("Invalid User Id");
            return;
          }

          return await context.database.get(
            defaultTable,
            `user_${userId}_${chatId}_${variable}`,
          );
        },
      },
      {
        name: "$getVar",
        callback: async (context: any) => {
          context.argsCheck(1);
          const [variable, defaultTable = context.database.tables[0]] =
            context.splits;

          if (context.isError) return;

          if (!(await context.database.hasTable(defaultTable))) {
            context.sendError(`Invalid table ${defaultTable} not found`);
            return;
          }

          return await context.database.get(defaultTable, variable);
        },
      },
      {
        name: "$globalCooldown",
        callback: async (context: any) => {
          context.argsCheck(1);
          const [time, textError] = context.splits;
          const userId =
            context.event.from?.id || context.event.message?.from.id;
          const commandName = context.command.name;
          const defaultTable = context.database.tables[0];
          context.checkArgumentTypes(["string", "string | undefined"]);

          if (context.isError) return;

          const cooldownKey = `cooldown_${userId}_${commandName}_${ms(time)}`;
          const userCooldown =
            (await context.database.get(defaultTable, cooldownKey)) || 0;
          const cooldown = userCooldown + +ms(time) - Date.now();
          if (cooldown > 0) {
            if (textError) {
              context.event.send(
                replaceData(formatTime(cooldown).units, textError),
              );
            } else context.isError = true;
          } else {
            await context.database.set(defaultTable, cooldownKey, Date.now());
          }
        },
      },
      {
        name: "$hasVar",
        callback: async (context: any) => {
          context.argsCheck(1);
          const [variable, defaultTable = context.database.tables[0]] =
            context.splits;

          if (!(await context.database.hasTable(defaultTable))) {
            context.sendError(`Invalid table ${defaultTable} not found`);
            return;
          }
          return await context.database.has(defaultTable, variable);
        },
      },
      {
        name: "$resetChatVar",
        callback: async (context: any) => {
          context.argsCheck(1);
          const [variable, defaultTable = context.database.tables[0]] =
            context.splits;

          context.checkArgumentTypes(["string", "string | undefined"]);

          if (context.isError) return;

          if (!(await context.database.has(defaultTable, variable))) {
            context.sendError(`Invalid variable ${variable} not found`);
            return;
          }

          const allChats = await context.database.all(defaultTable);
          let affectedChatIds: string[] = [];

          for (const variableKey of Object.keys(allChats)) {
            const variableValue = await context.database.get(
              defaultTable,
              variableKey,
            );
            const [, chatId] = variableKey.split("_");

            if (`chat_${chatId}_${variable}` !== variableKey) continue;

            affectedChatIds.push(chatId);
          }

          for (const chatId of affectedChatIds) {
            const defaultValue = await context.database.defaultValue(
              variable,
              defaultTable,
            );
            const chatVariableKey = `chat_${chatId}_${variable}`;
            await context.database.set(
              defaultTable,
              chatVariableKey,
              defaultValue,
            );
          }

          return affectedChatIds.length;
        },
      },
      {
        name: "$resetUserVar",
        callback: async (context: any) => {
          context.argsCheck(1);
          const [
            variable,
            chatId = context.event.chat?.id || context.event.message?.chat.id,
            defaultTable = context.database.tables[0],
          ] = context.splits;

          context.checkArgumentTypes([
            "string",
            "string | number | undefined",
            "string | undefined",
          ]);

          if (context.isError) return;

          if (!(await context.database.has(defaultTable, variable))) {
            context.sendError(`Invalid variable ${variable} not found`);
            return;
          }

          const allUsers = await context.database.all(defaultTable);
          let affectedUserIds: string[] = [];

          for (const variableKey of Object.keys(allUsers)) {
            const variableValue = await context.database.get(
              defaultTable,
              variableKey,
            );
            const [, userId] = variableKey.split("_");

            if (`user_${userId}_${chatId}_${variable}` !== variableKey)
              continue;

            affectedUserIds.push(userId);
          }

          for (const userId of affectedUserIds) {
            const defaultValue = await context.database.defaultValue(
              variable,
              defaultTable,
            );
            const userVariableKey = `user_${userId}_${chatId}_${variable}`;
            await context.database.set(
              defaultTable,
              userVariableKey,
              defaultValue,
            );
          }

          return affectedUserIds.length;
        },
      },
      {
        name: "$resetVar",
        callback: async (context: any) => {
          context.argsCheck(1);
          const [variable, defaultTable = context.database.tables[0]] =
            context.splits;

          context.checkArgumentTypes(["string", "string | undefined"]);

          if (context.isError) return;

          if (!(await context.database.has(defaultTable, variable))) {
            context.sendError(`Invalid variable ${variable} not found`);
            return;
          }

          const all = await context.database.all(defaultTable);
          let affectedIds: string[] = [];

          for (const variableKey of Object.keys(all)) {
            const [key] = variableKey.split("_");

            if (variableKey !== variable) continue;
            affectedIds.push(key);

            const defaultValue = await context.database.defaultValue(
              key,
              defaultTable,
            );
            await context.database.set(defaultTable, key, defaultValue);
          }

          return affectedIds.length;
        },
      },
      {
        name: "$setChatVar",
        callback: async (context: any) => {
          context.argsCheck(2);
          const [
            variable,
            value,
            chatId = context.event.chat?.id || context.event.message?.chat.id,
            defaultTable = context.database.tables[0],
          ] = context.splits;

          context.checkArgumentTypes([
            "string",
            "unknown",
            "string | number | undefined",
            "string | undefined",
          ]);

          if (context.isError) return;

          if (!(await context.database.has(defaultTable, variable))) {
            context.sendError(`Invalid variable ${variable} not found`);
            return;
          }

          await context.database.set(
            defaultTable,
            `chat_${chatId}_${variable}`,
            value,
          );
        },
      },
      {
        name: "$setMessageVar",
        callback: async (context: any) => {
          context.argsCheck(2);
          const [
            variable,
            value,
            messageId = context.event.message_id ||
              context.event.message?.message_id,
            defaultTable = context.database.tables[0],
          ] = context.splits;

          const chatId =
            context.event.chat?.id || context.event.message?.chat.id;

          context.checkArgumentTypes([
            "string",
            "unknown",
            "string | number | undefined",
            "string | undefined",
          ]);

          if (context.isError) return;

          if (!(await context.database.has(defaultTable, variable))) {
            context.sendError(`Invalid variable ${variable} not found`);
            return;
          }

          await context.database.set(
            defaultTable,
            `message_${messageId}_${chatId}_${variable}`,
            value,
          );
        },
      },
      {
        name: "$setUserVar",
        callback: async (context: any) => {
          context.argsCheck(2);
          const [
            variable,
            value,
            userId = context.event.from?.id || context.event.message?.from.id,
            defaultTable = context.database.tables[0],
          ] = context.splits;

          const chatId =
            context.event.chat?.id || context.event.message?.chat.id;

          context.checkArgumentTypes([
            "string",
            "unknown",
            "string | number | undefined",
            "string | undefined",
          ]);

          if (context.isError) return;

          if (!(await context.database.has(defaultTable, variable))) {
            context.sendError(`Invalid variable ${variable} not found`);
            return;
          }

          if (!(await hasChatPrivate(context.event, userId))) {
            context.sendError("Invalid User Id");
            return;
          }

          await context.database.set(
            defaultTable,
            `user_${userId}_${chatId}_${variable}`,
            value,
          );
        },
      },
      {
        name: "$setVar",
        callback: async (context: any) => {
          context.argsCheck(2);
          const [variable, value, defaultTable = context.database.tables[0]] =
            context.splits;

          if (context.isError) return;

          if (!(await context.database.has(defaultTable, variable))) {
            context.sendError(`Invalid variable ${variable} not found`);
            return;
          }

          if (!(await context.database.hasTable(defaultTable))) {
            context.sendError(`Invalid table ${defaultTable} not found`);
            return;
          }

          return await context.database.set(defaultTable, variable, value);
        },
      },
      {
        name: "$userLeaderBoard",
        callback: async (context: any) => {
          context.argsCheck(2);

          const [
            chatId = context.event.chat?.id || context.event.message?.chat.id,
            variable,
            text = "{top}. {username} - {value}",
            type = "asc",
            maxUser = 10,
            defaultTable = context.database.tables[0],
          ] = context.splits;
          const userId =
            context.event.from?.id || context.event.message?.from?.id;

          context.checkArgumentTypes([
            "number | string | undefined",
            "string",
            "string | undefined",
            "string | undefined",
            "number | undefined",
            "number | undefined",
            "string | undefined",
          ]);

          if (context.isError) return;

          let leaderboardText = "";
          let users: UsersData[] = [];
          const allEntries = await context.database.all(defaultTable);

          for (const entryKey of Object.keys(allEntries)) {
            const entryValue = await context.database.get(
              defaultTable,
              entryKey,
            );
            const [, userId] = entryKey.split("_");
            if (`user_${userId}_${chatId}_${variable}` !== entryKey) continue;

            if (!isNaN(Number(entryValue))) {
              users.push({ entry: Number(entryValue), user: entryKey });
            } else continue;
          }

          if (type === "asc") {
            users.sort((a, b) => Number(b.entry) - Number(a.entry));
          } else if (type === "dsc") {
            users.sort((a, b) => Number(a.entry) - Number(b.entry));
          }

          for (let index = 0; index < users.length; index++) {
            if (index + 1 === Number(maxUser)) break;
            const [, user] = users[index].user.split("_");
            const chatUserData = await context.telegram.getChatMember(
              chatId,
              user,
            );
            leaderboardText += replaceTextUsers(text, {
              ...chatUserData.user,
              value: users[index].entry,
              top: index + 1,
            });
          }

          return leaderboardText || "";
        },
      },
    ]);
  }

  hasTable(tableName: string) {
    return this.tables.includes(tableName);
  }

  defaultValue(vars: string, table: string) {
    return this.collection.get(`${vars}_${table}`);
  }

  async variables(
    variables: { [key: string]: unknown },
    tables: string | string[] = this.tables[0],
  ) {
    if (Array.isArray(tables)) {
      for (const table of tables) {
        for (const varName in variables) {
          const hasVar = await this.has(table, varName);
          this.collection.set(`${varName}_${table}`, variables[varName]);
          if (!hasVar) {
            await this.set(table, varName, variables[varName]);
          }
        }
      }
    } else if (typeof tables === "string") {
      for (const varName in variables) {
        const hasVar = await this.has(tables, varName);
        this.collection.set(`${varName}_${tables}`, variables[varName]);
        if (!hasVar) {
          await this.set(tables, varName, variables[varName]);
        }
      }
    } else {
      throw new AoijsError(
        "parameter",
        "the parameter should be of type 'string' or 'string[]'",
      );
    }
  }
}

export { MongoDBManager, MongoDBManagerOptions };
