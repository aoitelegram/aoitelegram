import ms from "ms";
import { formatTime, replaceData } from "../parser";

export default {
  name: "$chatCooldown",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$chatCooldown");
    const args = await ctx.getEvaluateArgs();
    const chatId = event.chat?.id || event.message?.chat.id;
    const defaultTable = args[5] || database.tables[0];
    ctx.checkArgumentTypes(args, error, ["string", "string | undefined"]);

    const cooldownKey = `${chatId}_${ms(args[0])}`;
    const userCooldown = (await database.get(defaultTable, cooldownKey)) || 0;
    const cooldown = userCooldown + +ms(args[0]) - Date.now();
    if (cooldown > 0) {
      if (!!args[1]) {
        if (ctx.replyMessage)
          event.reply(replaceData(formatTime(cooldown).units, args[1]));
        else event.send(replaceData(formatTime(cooldown).units, args[1]));
      }
      return true;
    } else {
      await database.set(defaultTable, cooldownKey, Date.now());
    }
  },
};
