import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$endIf")
  .setBrackets(false)
  .onCallback(async (context, func) => {
    return func.resolve();
  });
