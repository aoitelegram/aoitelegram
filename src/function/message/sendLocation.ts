import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sendLocation")
  .setBrackets(true)
  .setFields({
    name: "business_connection_id",
    required: false,
    type: [ArgsType.String],
  })
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
    name: "horizontal_accuracy",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "live_period",
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
      business_connection_id,
      chat_id,
      message_thread_id,
      latitude,
      longitude,
      horizontal_accuracy,
      live_period,
      heading,
      proximity_alert_radius,
      disable_notification,
      protect_content,
      message_effect_id,
    ] = await func.resolveFields(context);

    const result = await context.telegram.sendLocation({
      business_connection_id,
      chat_id,
      message_thread_id,
      latitude,
      longitude,
      horizontal_accuracy,
      live_period,
      heading,
      proximity_alert_radius,
      disable_notification,
      protect_content,
      message_effect_id,
      reply_parameters: context.getMessageOptions().reply_parameters,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
