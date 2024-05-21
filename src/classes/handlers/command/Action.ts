import type { AoiClient } from "../../AoiClient";

function onAction(telegram: AoiClient): void {
  telegram.on("callback_query:data", async (ctx) => {
    const actions = telegram.commands.get("action");
    if (!actions) return;

    for (const action of actions) {
      if (!("data" in action)) continue;
      if (ctx.data !== action.data) continue;
      await telegram.evaluateCommand(action, ctx);
    }
  });
}

export default onAction;
