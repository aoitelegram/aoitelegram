import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getMe")
  .setBrackets(false)
  .onCallback(async (context, func) => {
    return func.resolve(await context.telegram.getMe());
  });
