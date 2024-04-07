import { getObjectKey } from "../../utils";
import type { AoiClient } from "../AoiClient";

function onVariableDelete(telegram: AoiClient) {
  const events = telegram.events.get("variableDelete");
  if (!events) return;

  for (const event of events) {
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
      await telegram.evaluateCommand(event, { oldVariable, telegram });
    });
  }
}

export default onVariableDelete;
