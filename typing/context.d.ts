declare module "context" {
    import { Context } from "../Context";
    import { AoiManager } from "../src/classes/AoiManager";
    
    interface DataFunction {
  name: string;
  callback(ctx: Context, event: any, database: AoiManager, error: any): any;
}

    export { DataFunction };
}