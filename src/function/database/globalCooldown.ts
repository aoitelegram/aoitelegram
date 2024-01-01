import ms from "ms";
import { formatTime, replaceData } from "../parser";

export default {
  name: "$globalCooldown",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$globalCooldown");
    const args = await ctx.getEvaluateArgs();
    const userId = event.from?.id || event.message?.from.id;
    const commandName = ctx.fileName;
    const defaultTable = args[5] || database.tables[0];
    ctx.checkArgumentTypes(args, error, ["string", "string | undefined"]);

    const cooldownKey = `${userId}_${commandName}_${ms(args[0])}`;
    const userCooldown = database.get(defaultTable, cooldownKey) || 0;
    const cooldown = userCooldown + +ms(args[0]) - Date.now();
    if (cooldown > 0) {
      if (!!args[1]) {
        if (ctx.replyMessage)
          event.reply(replaceData(formatTime(cooldown).units, args[1]));
        else event.send(replaceData(formatTime(cooldown).units, args[1]));
      }
      return true;
    } else {
      database.set(defaultTable, cooldownKey, Date.now());
    }
  },
};
