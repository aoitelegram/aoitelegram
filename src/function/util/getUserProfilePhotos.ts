import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getUserProfilePhotos")
  .setBrackets(true)
  .setFields({
    name: "user_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "offset",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "limit",
    required: false,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [user_id, offset, limit] = await func.resolveFields(context);

    const result = await context.telegram.getUserProfilePhotos({
      user_id,
      offset,
      limit,
    });
    return func.resolve(result);
  });
