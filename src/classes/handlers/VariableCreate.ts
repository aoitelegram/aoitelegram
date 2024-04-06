import { getObjectKey } from "../../utils";
import type { AoiClient } from "../AoiClient";

function onVariableCreate(telegram: AoiClient) {
  const commands = telegram.commands.get("variableCreate");
  if (!commands) return;

  for (const command of commands) {
    telegram.database.on("create", async (newVariable) => {
      telegram.ensureCustomFunction({
        name: "$newVariable",
        brackets: true,
        fields: [
          {
            required: false,
          },
        ],
        callback: async (context, func) => {
          const options = await func.resolveAll(context);
          const result = getObjectKey(newVariable, options);
          return func.resolve(result);
        },
      });
      await telegram.evaluateCommand(command, { newVariable, telegram });
    });
  }
}

export default onVariableCreate;
