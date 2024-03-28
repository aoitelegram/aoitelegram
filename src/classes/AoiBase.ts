import fs from "node:fs";
import path from "node:path";
import importSync from "import-sync";
import { AoijsError } from "./AoiError";
import type { RequestInit } from "node-fetch";
import { Update } from "@telegram.ts/types";
import { setInterval, clearInterval } from "long-timeout";
import { AoiClient } from "./AoiClient";
import { ContextEvent, EventHandlers } from "./AoiTyping";
import { TelegramBot, Collection, Context } from "telegramsjs";
import { AoiManager, AoiManagerOptions } from "./AoiManager";
import { Interpreter, Complite } from "./core/";
import {
  LibDataFunction,
  DataFunction,
  LibWithDataFunction,
} from "./AoiTyping";
import { version } from "../index";

class AoiBase extends TelegramBot {
  database: AoiManager = {} as AoiManager;
  disableFunctions: string[];
  availableFunctions: Collection<string, LibWithDataFunction> =
    new Collection();

  constructor(
    token: string,
    requestOptions?: RequestInit,
    database?: AoiManagerOptions,
    disableFunctions?: string[],
    disableAoiDB?: boolean,
  ) {
    if (!token) {
      throw new AoijsError(
        "AoiBase",
        "You did not specify the 'token' parameter",
      );
    }
    super(token, requestOptions);
    this.disableFunctions = disableFunctions || [];
    this.availableFunctions = loadFunctionsLib(
      path.join(__dirname, "../function/"),
      new Collection<string, LibWithDataFunction>(),
      disableFunctions || [],
    );

    if (!disableAoiDB) {
      this.database = new AoiManager(database);
    }
  }

  on(event: string, listener: (...args: any[]) => void): this;

  on<T extends keyof EventHandlers>(event: T, listener: EventHandlers[T]): this;

  on(event: string, listener: (...data: any[]) => void) {
    super.on(event, listener);
    return this;
  }

  async evaluateCommand(
    command: string | { event: string },
    code: string,
    eventData: unknown,
    useNative?: Function[],
  ) {
    try {
      const complited = new Complite(code, {}, this.availableFunctions);
      const interpreter = new Interpreter(complited.compile(), eventData);
      return await interpreter.runInput();
    } catch (err) {
      console.log(err);
    }
  }

  addFunction(dataFunction: DataFunction | DataFunction[]) {
    if (Array.isArray(dataFunction)) {
      for (const func of dataFunction) {
        const functionName = func?.name?.toLowerCase();
        if (!functionName) {
          throw new AoijsError(
            "customFunction",
            "you did not specify the 'name' parameter",
          );
        }

        if (this.availableFunctions.has(functionName)) {
          throw new AoijsError(
            "customFunction",
            `the function "${functionName}" already exists; to overwrite it, use the <AoiClient>.editFunction method!`,
          );
        }

        if ((func?.version || 0) > version) {
          throw new AoijsError(
            "customFunction",
            `to load this function ${functionName}, the library version must be equal to or greater than ${func?.version || 0}`,
          );
        }

        this.availableFunctions.set(functionName, func);
      }
    } else {
      const functionName = dataFunction?.name?.toLowerCase();
      if (!functionName) {
        throw new AoijsError(
          "customFunction",
          "you did not specify the 'name' parameter",
        );
      }

      if (this.availableFunctions.has(functionName)) {
        throw new AoijsError(
          "customFunction",
          `the function "${functionName}" already exists; to overwrite it, use the <AoiClient>.editFunction method!`,
        );
      }

      if ((dataFunction?.version || 0) > version) {
        throw new AoijsError(
          "customFunction",
          `to load this function ${functionName}, the library version must be equal to or greater than ${dataFunction?.version || 0}`,
        );
      }

      this.availableFunctions.set(functionName, dataFunction);
    }
    return this;
  }

  ensureFunction(dataFunction: DataFunction | DataFunction[]) {
    if (Array.isArray(dataFunction)) {
      for (const func of dataFunction) {
        const functionName = func?.name?.toLowerCase();
        if (!functionName) {
          throw new AoijsError(
            "customFunction",
            "you did not specify the 'name' parameter",
          );
        }

        if ((func?.version || 0) > version) {
          throw new AoijsError(
            "customFunction",
            `to load this function ${functionName}, the library version must be equal to or greater than ${func?.version || 0}`,
          );
        }

        this.availableFunctions.set(functionName, func);
      }
    } else {
      const functionName = dataFunction?.name?.toLowerCase();
      if (!functionName) {
        throw new AoijsError(
          "customFunction",
          "you did not specify the 'name' parameter",
        );
      }

      if ((dataFunction?.version || 0) > version) {
        throw new AoijsError(
          "customFunction",
          `to load this function ${functionName}, the library version must be equal to or greater than ${dataFunction?.version || 0}`,
        );
      }

      this.availableFunctions.set(functionName, dataFunction);
    }
    return this;
  }

  removeFunction(functionName: string | string[]) {
    const functionNames = Array.isArray(functionName)
      ? functionName
      : [functionName];

    if (functionNames.length < 1) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'name' parameter",
      );
    }

    for (const name of functionNames) {
      const lowerCaseName = name.toLowerCase();
      const hasDeleted = this.availableFunctions.delete(lowerCaseName);
      if (!hasDeleted) {
        throw new AoijsError(
          "customFunction",
          `the function "${lowerCaseName}" does not exist or has already been deleted`,
        );
      }
    }
    return true;
  }

  editFunction(dataFunction: DataFunction | DataFunction[]) {
    const functionsToEdit = Array.isArray(dataFunction)
      ? dataFunction
      : [dataFunction];

    if (!functionsToEdit.length) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'name' parameter",
      );
    }

    for (const func of functionsToEdit) {
      const lowerCaseName = func?.name?.toLowerCase();
      if (!this.availableFunctions.has(lowerCaseName)) {
        throw new AoijsError(
          "customFunction",
          `the function "${lowerCaseName}" does not exist; you can only modify functions that have been added recently`,
        );
      }

      this.availableFunctions.set(lowerCaseName, func);
    }

    return true;
  }

  getFunction(functionName: string | string[]) {
    const functionNames = Array.isArray(functionName)
      ? functionName
      : [functionName];

    if (functionNames.length < 1) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'name' parameter",
      );
    }

    if (functionNames.length > 1) {
      return functionNames.map((name) => this.availableFunctions.get(name));
    } else {
      return this.availableFunctions.get(functionNames[0]);
    }
  }

  hasFunction(functionName: string | string[]) {
    if (Array.isArray(functionName)) {
      return functionName.map((fun) => ({
        name: fun,
        result: this.availableFunctions.has(fun),
      }));
    } else if (typeof functionName === "string") {
      return this.availableFunctions.has(functionName);
    } else {
      throw new AoijsError(
        "customFunction",
        `the specified type should be "string | string[]`,
      );
    }
  }

  get countFunction() {
    return this.availableFunctions.size;
  }

  loopCommand(options: {
    every?: number;
    code: string;
    useNative?: Function[];
  }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }

    let currentIndex = 1;
    const intervalId = setInterval(async () => {
      this.ensureFunction([
        {
          name: "$break",
          callback: () => clearInterval(intervalId),
        },
        {
          name: "$continue",
          callback: (context) => (context.isError = true),
        },
        {
          name: "$index",
          callback: () => currentIndex,
        },
      ]);

      await this.evaluateCommand(
        { event: "loop" },
        options.code,
        this,
        options.useNative,
      );
      currentIndex++;
    }, options.every || 60000);
    return this;
  }

  readyCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("ready", async (ctx) => {
      await this.evaluateCommand(
        { event: "ready" },
        options.code,
        {
          ...ctx,
          telegram: this,
        },
        options.useNative,
      );
    });
    return this;
  }

  messageCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("message", async (ctx) => {
      await this.evaluateCommand(
        { event: "message" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  callbackQueryCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("callback_query", async (ctx) => {
      await this.evaluateCommand(
        { event: "callback_query" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  messageReactionCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("message_reaction", async (ctx) => {
      await this.evaluateCommand(
        { event: "message_reaction" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  messageReactionCountCommand(options: {
    code: string;
    useNative?: Function[];
  }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("message_reaction_count", async (ctx) => {
      await this.evaluateCommand(
        { event: "message_reaction_count" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  editedMessageCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("edited_message", async (ctx) => {
      await this.evaluateCommand(
        { event: "edited_message" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  channelPostCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("channel_post", async (ctx) => {
      await this.evaluateCommand(
        { event: "channel_post" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  editedChannelPostCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("edited_channel_post", async (ctx) => {
      await this.evaluateCommand(
        { event: "edited_channel_post" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  inlineQueryCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("inline_query", async (ctx) => {
      await this.evaluateCommand(
        { event: "inline_query" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  shippingQueryCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("shipping_query", async (ctx) => {
      await this.evaluateCommand(
        { event: "shipping_query" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  preCheckoutQueryCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("pre_checkout_query", async (ctx) => {
      await this.evaluateCommand(
        { event: "pre_checkout_query" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  pollCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("poll", async (ctx) => {
      await this.evaluateCommand(
        { event: "poll" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  pollAnswerCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("poll_answer", async (ctx) => {
      await this.evaluateCommand(
        { event: "poll_answer" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  chatMemberCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("chat_member", async (ctx) => {
      await this.evaluateCommand(
        { event: "chat_member" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  myChatMemberCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("my_chat_member", async (ctx) => {
      await this.evaluateCommand(
        { event: "my_chat_member" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  chatJoinRequestCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("chat_join_request", async (ctx) => {
      await this.evaluateCommand(
        { event: "chat_join_request" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  chatBoostCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("chat_boost", async (ctx) => {
      await this.evaluateCommand(
        { event: "chat_boost" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  removedChatBoostCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.on("removed_chat_boost", async (ctx) => {
      await this.evaluateCommand(
        { event: "removed_chat_boost" },
        options.code,
        ctx,
        options.useNative,
      );
    });
    return this;
  }

  variableCreateCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.database.on("create", async (newVariable) => {
      this.ensureFunction({
        name: "$newVariable",
        callback: (context) => {
          const result = getObjectKey(newVariable, context.inside as string);
          return typeof result === "object" ? JSON.stringify(result) : result;
        },
      });
      await this.evaluateCommand(
        { event: "variableCreate" },
        options.code,
        {
          newVariable,
          telegram: this,
        },
        options.useNative,
      );
    });
    return this;
  }

  variableUpdateCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.database.on("update", async (variable) => {
      this.ensureFunction({
        name: "$variable",
        callback: (context) => {
          const result = getObjectKey(variable, context.inside as string);
          return typeof result === "object" ? JSON.stringify(result) : result;
        },
      });
      await this.evaluateCommand(
        { event: "variableUpdate" },
        options.code,
        {
          variable,
          telegram: this,
        },
        options.useNative,
      );
    });
    return this;
  }

  variableDeleteCommand(options: { code: string; useNative?: Function[] }) {
    if (!options?.code) {
      throw new AoijsError(
        "parameter",
        "you did not specify the 'code' parameter",
      );
    }
    this.database.on("delete", async (oldVariable) => {
      this.ensureFunction({
        name: "$oldVariable",
        callback: (context) => {
          const result = getObjectKey(oldVariable, context.inside as string);
          return typeof result === "object" ? JSON.stringify(result) : result;
        },
      });
      await this.evaluateCommand(
        { event: "variableDelete" },
        options.code,
        {
          oldVariable,
          telegram: this,
        },
        options.useNative,
      );
    });
    return this;
  }

  async variables(
    options: { [key: string]: unknown },
    tables?: string | string[],
  ) {
    await this.database.variables(options, tables);
  }
}

function loadFunctionsLib(
  dirPath: string,
  availableFunctions: Collection<string, LibWithDataFunction>,
  disableFunctions: string[],
) {
  const processFile = (itemPath: string) => {
    try {
      const dataFunction = require(itemPath).default;
      if (!dataFunction?.name && typeof !dataFunction?.callback !== "function")
        return;
      const dataFunctionName = dataFunction.name.toLowerCase();
      if (disableFunctions.includes(dataFunctionName)) return;

      availableFunctions.set(dataFunctionName, dataFunction);
    } catch (error) {
      console.error(error);
    }
  };

  const processItem = (item: string) => {
    const itemPath = path.join(dirPath, item);
    try {
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        loadFunctionsLib(itemPath, availableFunctions, disableFunctions);
      } else if (itemPath.endsWith(".js")) {
        processFile(itemPath);
      }
    } catch (error) {
      console.error(error);
    }
  };

  try {
    const items = fs.readdirSync(dirPath);
    items.map(processItem);
    return availableFunctions;
  } catch (error) {
    console.error(error);
    return availableFunctions;
  }
}

export { AoiBase, TelegramOptions };
