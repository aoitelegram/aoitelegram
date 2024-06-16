import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$refundStarPayment")
  .setBrackets(true)
  .setFields({
    name: "user_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "telegram_payment_charge_id",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [user_id, telegram_payment_charge_id] =
      await func.resolveFields(context);

    await context.telegram.refundStarPayment(
      user_id,
      telegram_payment_charge_id,
    );

    return func.resolve(true);
  });
