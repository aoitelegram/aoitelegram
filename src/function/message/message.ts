import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$message")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(context.eventData.text);
  });
