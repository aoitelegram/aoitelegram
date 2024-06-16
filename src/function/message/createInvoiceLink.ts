import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$createInvoiceLink")
  .setBrackets(true)
  .setFields({
    name: "title",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "description",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "payload",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "currency",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "prices",
    required: true,
    type: [ArgsType.Object],
  })
  .setFields({
    name: "provider_token",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "max_tip_amount",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "suggested_tip_amounts",
    required: false,
    type: [ArgsType.Array],
  })
  .setFields({
    name: "provider_data",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "photo_url",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "photo_size",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "photo_width",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "photo_height",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "need_name",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "need_phone_number",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "need_email",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "need_shipping_address",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "send_phone_number_to_provider",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "send_email_to_provider",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "is_flexible",
    required: false,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [
      title,
      description,
      payload,
      currency,
      prices,
      provider_token,
      max_tip_amount,
      suggested_tip_amounts,
      provider_data,
      photo_url,
      photo_size,
      photo_width,
      photo_height,
      need_name,
      need_phone_number,
      need_email,
      need_shipping_address,
      send_phone_number_to_provider,
      send_email_to_provider,
      is_flexible,
    ] = await func.resolveFields(context);

    const invoiceLink = await context.telegram.createInvoiceLink({
      title,
      description,
      payload,
      provider_token,
      currency,
      prices,
      max_tip_amount,
      suggested_tip_amounts,
      provider_data,
      photo_url,
      photo_size,
      photo_width,
      photo_height,
      need_name,
      need_phone_number,
      need_email,
      need_shipping_address,
      send_phone_number_to_provider,
      send_email_to_provider,
      is_flexible,
    });

    return func.resolve(invoiceLink);
  });
