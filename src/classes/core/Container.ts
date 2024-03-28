import type { ContextEvent } from "../AoiTyping";
import { Collection } from "@telegram.ts/collection";
import { ConditionChecker, WordMatcher } from "../../utils/";

class Container {
  readonly array: Collection<string, any[]> = new Collection();
  readonly object: Collection<string, object> = new Collection();
  readonly random: Collection<string, number> = new Collection();
  readonly condition: ConditionChecker = ConditionChecker;
  readonly wordMatcher: typeof WordMatcher = WordMatcher;
  eventData: ContextEvent;

  constructor(ctx: ContextEvent) {
    this.eventData = ctx;
  }
}

export { Container };
