import { TelegramBot } from "telegramsjs";
import { AoijsError } from "./AoiError";
import { Runtime } from "../Runtime";

class AoiBase extends TelegramBot {
  constructor(token: string) {
    super(token);
  }

  runCode(command: string, code: string, telegram: any) {
    const runtime = new Runtime(telegram);
    runtime.runInput(command, code);
  }

  readyCommand(options: { code: string }) {
    if (!options?.code)
      throw new AoijsError("You did not specify the 'code' parameter.");
    super.on("ready", (ctx) => {
      this.runCode("ready", options.code, ctx);
    });
  }
}

export { AoiBase };
