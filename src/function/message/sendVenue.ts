import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sendVenue")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "message_thread_id",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "latitude",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "longitude",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "title",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "address",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "foursquare_id",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "foursquare_type",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "google_place_id",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "google_place_type",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "disable_notification",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "protect_content",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "message_effect_id",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [
      chat_id,
      message_thread_id,
      latitude,
      longitude,
      title,
      address,
      foursquare_id,
      foursquare_type,
      google_place_id,
      google_place_type,
      disable_notification,
      protect_content,
      message_effect_id,
    ] = await func.resolveFields(context);

    const result = await context.telegram.sendVenue({
      chat_id,
      message_thread_id,
      latitude,
      longitude,
      title,
      address,
      foursquare_id,
      foursquare_type,
      google_place_id,
      google_place_type,
      disable_notification,
      protect_content,
      message_effect_id,
      reply_parameters: context.getMessageOptions().reply_parameters,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
