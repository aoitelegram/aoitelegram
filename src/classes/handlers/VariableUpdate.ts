import { ArgsType } from "../AoiFunction";
import { getObjectKey } from "../../utils";
import type { AoiClient } from "../AoiClient";

function onVariableUpdate(telegram: AoiClient): void {
  const events = telegram.events.get("variableUpdate");
  if (!events) return;

  telegram.database.on("update", async (variable) => {
    for (const event of events) {
      telegram.ensureCustomFunction({
        name: "$variable",
        brackets: true,
        fields: [
          {
            name: "property",
            type: [ArgsType.String],
            required: false,
          },
        ],
        callback: async (context, func) => {
          const options = await func.resolveAllFields(context);
          const result = getObjectKey(variable, options);
          return func.resolve(result);
        },
      });
      await telegram.evaluateCommand(event, { variable, telegram });
    }
  });
}

export default onVariableUpdate;
