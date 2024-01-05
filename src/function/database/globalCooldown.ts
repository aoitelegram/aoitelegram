import ms from "ms";
import { formatTime, replaceData } from "../parser";

export default {
  name: "$globalCooldown",
  callback: (context) => {
    context.argsCheck(1);
    const [time, textError] = context.splits;
    const userId = context.event.from?.id || context.event.message?.from.id;
    const commandName = context.command.name;
    const defaultTable = context.database.tables[0];
    context.checkArgumentTypes(["string", "string | undefined"]);

    if (context.isError) return;

    const cooldownKey = `${userId}_${commandName}_${ms(time)}`;
    const userCooldown = context.database.get(defaultTable, cooldownKey) || 0;
    const cooldown = userCooldown + +ms(time) - Date.now();
    if (cooldown > 0) {
      if (textError) {
        context.event.send(replaceData(formatTime(cooldown).units, textError));
      } else context.isError = true;
    } else {
      context.database.set(defaultTable, cooldownKey, Date.now());
    }
  },
};
