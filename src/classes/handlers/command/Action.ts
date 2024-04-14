import type { AoiClient } from "../../AoiClient";

interface IActionDescription {
  data: string;
  code: string;
  chatId?: number | string;
  reverseReading?: boolean;
}

function onAction(telegram: AoiClient): void {
  const actions = telegram.commands.get("action");
  if (!actions) return;

  telegram.on("callback_query:data", async (ctx) => {
    for (const action of actions) {
      if (!("data" in action)) continue;
      if (ctx.data !== action.data) continue;
      await telegram.evaluateCommand(action, ctx);
    }
  });
}

export default onAction;
export { IActionDescription };
