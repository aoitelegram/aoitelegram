import type { AoiClient } from "../AoiClient";
import { setInterval, clearInterval } from "long-timeout";

function onLoop(telegram: AoiClient): void {
  const events = telegram.events.get("loop");
  if (!events) return;

  for (const event of events) {
    let currentIndex = 1;
    const intervalId = setInterval(async () => {
      telegram.ensureCustomFunction([
        {
          name: "$break",
          brackets: false,
          callback: (context, func) => {
            clearInterval(intervalId);
            return func.resolve();
          },
        },
        {
          name: "$continue",
          brackets: false,
          callback: (context, func) => func.reject(),
        },
        {
          name: "$index",
          callback: (context, func) => func.resolve(currentIndex),
        },
      ]);

      await telegram.evaluateCommand(event, telegram);
      currentIndex++;
    }, event.every || 60000);
  }
}

export default onLoop;
