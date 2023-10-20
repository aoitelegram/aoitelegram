declare module "context" {
  import { Context } from "../Context";
  import { AoiManager } from "../src/classes/AoiManager";
  import { MessageError } from "../src/classes/AoiError";

  interface DataFunction {
    name: string;
    callback(
      ctx: Context,
      event: any,
      database: AoiManager,
      error: MessageError,
    ): any;
  }

  export { DataFunction };
}
