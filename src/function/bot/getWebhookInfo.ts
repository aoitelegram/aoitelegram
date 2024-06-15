import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getWebhookInfo")
  .setBrackets(false)
  .onCallback(async (context, func) => {
    return func.resolve(await context.telegram.getWebhookInfo());
  });
