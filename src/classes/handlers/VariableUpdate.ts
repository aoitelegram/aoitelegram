import { getObjectKey } from "../../utils";
import type { AoiClient } from "../AoiClient";

function onVariableUpdate(telegram: AoiClient): void {
  const events = telegram.events.get("variableUpdate");
  if (!events) return;

  for (const event of events) {
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
      await telegram.evaluateCommand(event, { variable, telegram });
    });
  }
}

export default onVariableUpdate;
