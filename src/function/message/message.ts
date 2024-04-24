import { FunctionManager } from "../../classes/FunctionManager";

export default new FunctionManager()
  .setName("$message")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(context.eventData.text);
  });
