import { ArgsType } from "../AoiFunction";
import { getObjectKey } from "../../utils";
import type { AoiClient } from "../AoiClient";

function onVariableCreate(telegram: AoiClient): void {
  const events = telegram.events.get("variableCreate");
  if (!events) return;

  telegram.database.on("create", async (newVariable) => {
    for (const event of events) {
      telegram.ensureCustomFunction({
        name: "$newVariable",
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
          const result = getObjectKey(newVariable, options);
          return func.resolve(result);
        },
      });
      await telegram.evaluateCommand(event, { newVariable, telegram });
    }
  });
}

export default onVariableCreate;
