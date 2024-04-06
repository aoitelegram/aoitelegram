import { getObjectKey } from "../../utils";
import type { AoiClient } from "../AoiClient";

function onVariableDelete(telegram: AoiClient) {
  const commands = telegram.commands.get("variableDelete");
  if (!commands) return;

  for (const command of commands) {
    telegram.database.on("create", async (oldVariable) => {
      telegram.ensureCustomFunction({
        name: "$oldVariable",
        brackets: true,
        fields: [
          {
            required: false,
          },
        ],
        callback: async (context, func) => {
          const options = await func.resolveAll(context);
          const result = getObjectKey(oldVariable, options);
          return func.resolve(result);
        },
      });
      await telegram.evaluateCommand(command, { oldVariable, telegram });
    });
  }
}

export default onVariableDelete;
