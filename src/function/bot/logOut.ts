import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$logOut")
  .setBrackets(false)
  .onCallback(async (context, func) => {
    return func.resolve(await context.telegram.logOut());
  });
