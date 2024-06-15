import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getForumTopicIconStickers")
  .setBrackets(false)
  .onCallback(async (context, func) => {
    return func.resolve(await context.telegram.getForumTopicIconStickers());
  });
