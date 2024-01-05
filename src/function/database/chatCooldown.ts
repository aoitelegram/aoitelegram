import ms from "ms";
import { formatTime, replaceData } from "../parser";

export default {
  name: "$chatCooldown",
  callback: (context) => {
    context.argsCheck(1);
    const [time, textError, defaultTable = context.database.tables[0]] =
      context.splits;
    const chatId = context.event.chat?.id || context.event.message?.chat.id;
    context.checkArgumentTypes([
      "string",
      "string | undefined",
      "string | undefined",
    ]);
    if (context.isError) return;

    const cooldownKey = `${chatId}_${ms(time)}`;
    const userCooldown = context.database.get(defaultTable, cooldownKey) || 0;
    const cooldown = userCooldown + +ms(time) - Date.now();
    if (cooldown > 0) {
      if (textError) {
        if (context.replyMessage)
          context.sendError(replaceData(formatTime(cooldown).units, textError));
      } else context.isError = true;
    } else {
      context.database.set(defaultTable, cooldownKey, Date.now());
    }
  },
};
