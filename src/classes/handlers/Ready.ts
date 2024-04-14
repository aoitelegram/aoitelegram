import type { AoiClient } from "../AoiClient";

async function onReady(telegram: AoiClient): Promise<void> {
  const events = telegram.events.get("ready");
  if (!events) return;

  for (const event of events) {
    await telegram.evaluateCommand(event, telegram);
  }
}

export default onReady;
