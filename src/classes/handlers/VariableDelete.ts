import { ArgsType } from "../AoiFunction";
import { getObjectKey } from "../../utils";
import type { AoiClient } from "../AoiClient";

function onVariableDelete(telegram: AoiClient): void {
  const events = telegram.events.get("variableDelete");
  if (!events) return;

  telegram.database.on("create", async (oldVariable) => {
    for (const event of events) {
      telegram.ensureCustomFunction({
        name: "$oldVariable",
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
          const result = getObjectKey(oldVariable, options);
          return func.resolve(result);
        },
      });
      await telegram.evaluateCommand(event, { oldVariable, telegram });
    }
  });
}

export default onVariableDelete;
