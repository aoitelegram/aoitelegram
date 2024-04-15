import { getObjectKey } from "../../utils";
import type { AoiClient } from "../AoiClient";

function onVariableCreate(telegram: AoiClient): void {
  const events = telegram.events.get("variableCreate");
  if (!events) return;

  for (const event of events) {
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
          const options = await func.resolveAllFields(context);
          const result = getObjectKey(newVariable, options);
          return func.resolve(result);
        },
      });
      await telegram.evaluateCommand(event, { newVariable, telegram });
    });
  }
}

export default onVariableCreate;
