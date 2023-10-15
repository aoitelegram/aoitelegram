import { TelegramBot, type Context } from "telegramsjs";
import { UserFromGetMe, Update } from "@telegram.ts/types";
import { AoijsError } from "./AoiError";
import { Runtime } from "../Runtime";

type AllowedUpdates = ReadonlyArray<Exclude<keyof Update, "update_id">>;

interface TelegramOptions {
  limit?: number;
  timeout?: number;
  allowed_updates?: AllowedUpdates;
  session?: unknown;
}

class AoiBase extends TelegramBot {
  constructor(token: string, telegram: TelegramOptions = {}) {
    super(token, telegram);
  }

  async runCode(
    command: string,
    code: string,
    telegram: (TelegramBot & Context) | UserFromGetMe,
  ) {
    const runtime = new Runtime(telegram);
    await runtime.runInput(command, code);
  }

  readyCommand(options: { code: string }) {
    if (!options?.code)
      throw new AoijsError("You did not specify the 'code' parameter.");
    super.on("ready", async (ctx) => {
      await this.runCode("ready", options.code, ctx);
    });
  }

  messageCommand(options: { code: string }) {
    if (!options?.code)
      throw new AoijsError("You did not specify the 'code' parameter.");
    super.on("message", async (ctx) => {
      await this.runCode("command", options.code, ctx);
    });
  }
}

export { AoiBase, TelegramOptions };
