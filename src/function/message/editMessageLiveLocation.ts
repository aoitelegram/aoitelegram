import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$editMessageLiveLocation")
  .setBrackets(true)
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
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "message_id",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "inline_message_id",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "live_period",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "horizontal_accuracy",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "heading",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "proximity_alert_radius",
    required: false,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [
      latitude,
      longitude,
      chat_id,
      message_id,
      inline_message_id,
      live_period,
      horizontal_accuracy,
      heading,
      proximity_alert_radius,
    ] = await func.resolveFields(context);

    const result = await context.telegram.editMessageLiveLocation({
      chat_id,
      message_id,
      inline_message_id,
      latitude,
      longitude,
      live_period,
      horizontal_accuracy,
      heading,
      proximity_alert_radius,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
