declare module "context" {
  import { Context } from "../Context";
  import { AoiManager } from "../src/classes/AoiManager";
  import { MessageError } from "../src/classes/AoiError";
  import { type Context as EventContext } from "telegramsjs";

  type DataFunction =
    | {
        name: string;
        type: "aoitelegram";
        version?: string;
        params?: string[];
        code: string;
      }
    | {
        name: string;
        type?: "js";
        version?: string;
        callback: (
          ctx: Context,
          event: EventContext["telegram"],
          database: AoiManager,
          error: MessageError,
        ) => unknown;
      };

  export { DataFunction };
}
