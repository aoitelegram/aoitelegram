import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$ping")
  .setBrackets(false)
  .onCallback(async (context, func) => {
    const now = Date.now();
    await context.telegram.getMe?.();
    return func.resolve(Date.now() - now);
  });
