import { AoiFunction } from "@structures/AoiFunction";

export default new 
    AoiFunction()
  .setName("$ping")
  .setBrackets(false)
  .onCallback(async (context, func) => {
    const now = Date.now();
    await context.telegram.getMe();
    return func.resolve(Date.now() - now);
  });
