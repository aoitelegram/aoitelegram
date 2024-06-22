import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$argsCount")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(context.eventData?.text?.split(/\s+/).length);
  });
