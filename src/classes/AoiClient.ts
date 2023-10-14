import { TelegramBot } from "telegramsjs";
import { AoijsError } from "./AoiError";
import { Runtime } from "../Runtime";

class AoiClient extends TelegramBot {
  constructor(token: string) {
    super(token);
  }

  #runCode(command: string, code: string, telegram: any) {
    const runtime = new Runtime(telegram);
    const result = runtime.runInput(command, code);
  }

  // @ts-ignore
  command(options: { name: string; code: string }) {
    super.command(options.name, (ctx) => {
      this.#runCode(options.name, options.code, ctx);
    });
    //    this.#runCode(command, callback());
  }

  connect() {
    super.login();
  }
}

export { AoiClient };
