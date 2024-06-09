import ms from "ms";
import { AoiManager } from "@structures/AoiManager";
import { formatTime, replaceData } from "@utils/Parser";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$globalCooldown")
  .setBrackets(true)
  .setFields({
    name: "time",
    required: true,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "textError",
    required: false,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "table",
    required: false,
    type: [ArgsType.Any],
    defaultValue: async (context) => context.database.tables[0],
  })
  .onCallback(async (context, func) => {
    if (!(context.database instanceof AoiManager)) {
      return func.reject(
        "You can use this function only if the class for the database is a built-in class.",
      );
    }

    const [time, textError, table] = await func.resolveFields(context);

    if (!(await context.database.hasTable(table))) {
      return func.reject(`Invalid table "${table}" not found`);
    }

    const userId =
      context.eventData.from?.id || context.eventData.message?.from?.id;

    const cooldownKey = `cooldown_${userId}_${context.command.name}_${time.ms}`;
    const userCooldown = (await context.database.get(table, cooldownKey)) || 0;
    const cooldown = userCooldown + time.ms - Date.now();
    if (cooldown > 0) {
      if (textError) {
        if ("reply" in context.eventData)
          return func.reject(
            replaceData(formatTime(cooldown).units, textError),
            true,
          );
      } else {
        context.stopCode = true;
        return func.resolve();
      }
    } else {
      await context.database.set(table, cooldownKey, Date.now());
    }

    return func.resolve();
  });
