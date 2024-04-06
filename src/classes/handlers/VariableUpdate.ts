import { getObjectKey } from "../../utils";
import type { AoiClient } from "../AoiClient";

function onVariableUpdate(telegram: AoiClient) {
  const commands = telegram.commands.get("variableUpdate");
  if (!commands) return;

  for (const command of commands) {
    telegram.database.on("update", async (variable) => {
      telegram.ensureCustomFunction({
        name: "$variable",
        brackets: true,
        fields: [
          {
            required: false,
          },
        ],
        callback: async (context, func) => {
          const options = await func.resolveAll(context);
          const result = getObjectKey(variable, options);
          return func.resolve(result);
        },
      });
      await telegram.evaluateCommand(command, { variable, telegram });
    });
  }
}

export default onVariableUpdate;
