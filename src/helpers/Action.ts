import { AoiClient } from "../classes/AoiClient";

interface ActionDescription {
  data: string;
  answer?: boolean;
  code: string;
}

/**
 * Class representing an action handler for AoiClient.
 */
class Action {
  /**
   * Array of registered actions.
   * @private
   */
  private actions: ActionDescription[] = [];

  /**
   * Instance of AoiClient used for communication with the Telegram API.
   * @private
   */
  private telegram: AoiClient;

  /**
   * Creates a new instance of ActionHandler.
   * @param telegram Instance of AoiClient used for communication with the Telegram API.
   */
  constructor(telegram: AoiClient) {
    this.telegram = telegram;
  }

  /**
   * Registers a new action.
   * @param action Action description object.
   * @returns This ActionHandler instance for method chaining.
   */
  register(action: ActionDescription) {
    const existingIndex = this.actions.findIndex(
      (map) => map.data === action.data,
    );
    if (existingIndex !== -1) {
      this.actions[existingIndex] = action;
    } else {
      this.actions.push(action);
    }

    return this;
  }

  /**
   * Starts handling incoming callback queries.
   */
  handler() {
    this.telegram.on("callback_query:data", (query) => {
      const data = query.data;

      if (!this.actions.length) return;

      const action = this.actions.find((action) => action.data === data);

      if (action) {
        if (action.answer) {
          query.answerCallbackQuery().catch(() => console.log);
        }

        this.telegram.evaluateCommand(
          { event: "callback_query" },
          action.code,
          query,
        );
      }
    });
  }
}

export { Action, ActionDescription };
