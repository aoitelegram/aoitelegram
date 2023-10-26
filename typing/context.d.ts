declare module "context" {
  import { Context } from "../Context";
  import { AoiManager } from "../src/classes/AoiManager";
  import { MessageError } from "../src/classes/AoiError";
  import { type Context as EventContext } from "telegramsjs";

  interface DataFunction {
    name: string;
    version?: string;
    callback: (
      ctx: Context,
      event: EventContext["telegram"],
      database: AoiManager,
      error: MessageError,
    ) => unknown;
  }

  export { DataFunction };
}
