import { AoijsError } from "../classes/AoiError";
import { AoiClient } from "../classes/AoiClient";

interface ActionDescription {
  data: string;
  answer?: boolean;
  code: string;
  useNative?: Function[];
  [key: string]: unknown;
}

function filterToParams(array: ActionDescription[], search: string) {
  return array.filter((action) => action.data === search);
}

class Action {
  actions: ActionDescription[] = [];
  telegram: AoiClient;

  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  register(action: ActionDescription) {
    this.actions.push(action);
    return this;
  }

  handler() {
    this.telegram.on("callback_query:data", async (query) => {
      const queryData = query.data;
      if (!this.actions.length) return;
      const actions = filterToParams(this.actions, queryData);

      if (!actions.length) return;

      for (const actionDescription of actions) {
        if (actionDescription.answer) {
          await query.answerCallbackQuery().catch(() => console.log);
        }

        await this.telegram.evaluateCommand(
          { event: "callback_query" },
          actionDescription.code,
          query,
          actionDescription.useNative,
        );
      }
    });
  }
}

export { Action, ActionDescription };
