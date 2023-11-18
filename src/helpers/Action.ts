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
    this.actions.push(action);
    return this;
  }

  /**
   * Starts handling incoming callback queries.
   */
  handler() {
    this.telegram.on("callback_query:data", async (query) => {
      const data = query.data;

      for (const action of this.actions) {
        if (action.data !== data) continue;
        if (action.answer) {
          await query.answerCallbackQuery().catch(() => console.log);
        }

        await this.telegram.evaluateCommand(
          { event: "callback_query" },
          action.code,
          query,
        );
        break;
      }
    });
  }
}

export { Action, ActionDescription };
