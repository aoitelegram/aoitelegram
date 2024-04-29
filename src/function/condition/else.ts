import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$else")
  .setBrackets(false)
  .onCallback(async (context, func) => {
    return func.resolve();
  });
