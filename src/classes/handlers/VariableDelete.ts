import { getObjectKey } from "@utils/Helpers";
import type { AoiClient } from "../AoiClient";
import { ArgsType, AoiFunction } from "../AoiFunction";

function onVariableDelete(telegram: AoiClient): void {
  telegram.database.on("create", async (oldVariable) => {
    const events = telegram.events.get("variableDelete");
    if (!events) return;

    for (const event of events) {
      telegram.ensureCustomFunction(
        new AoiFunction()
          .setName("$oldVariable")
          .setBrackets(true)
          .setFields({
            name: "property",
            type: [ArgsType.String],
            required: false,
          })
          .onCallback(async (context, func) => {
            const options = await func.resolveAllFields(context);
            const result = getObjectKey(oldVariable, options);
            return func.resolve(result);
          }),
      );

      await telegram.evaluateCommand(event, { oldVariable, telegram });
    }
  });
}

export default onVariableDelete;
