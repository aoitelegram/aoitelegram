import { AoiBase } from "../AoiBase";
import type { AoiClient } from "../AoiClient";
import type { ContextEvent } from "../AoiTyping";
import type { Update } from "@telegram.ts/types";
import { Collection } from "@telegram.ts/collection";
import { ConditionChecker, WordMatcher } from "../../utils/";

type EventData<T> = { eventData: T } & Container;

class Container {
  readonly array: Collection<string, any[]> = new Collection();
  readonly object: Collection<string, object> = new Collection();
  readonly random: Collection<string, number> = new Collection();
  readonly condition: ConditionChecker = ConditionChecker;
  readonly wordMatcher: typeof WordMatcher = WordMatcher;
  public suppressErrors: string = "";
  public readonly eventData: ContextEvent;
  readonly telegram: AoiClient;

  constructor(ctx: ContextEvent) {
    this.eventData = ctx;
    this.telegram = (ctx instanceof AoiBase
      ? ctx
      : ctx?.api instanceof AoiBase
        ? ctx.api
        : {}) as unknown as AoiClient;
  }

  setSuppressErrors(reason: string) {
    this.suppressErrors = reason;
    return this;
  }

  isMessage(): this is EventData<Update["message"]> {
    return (
      "updateType" in this.eventData && this.eventData.updateType === "message"
    );
  }

  isEditedMessage(): this is EventData<Update["edited_message"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "edited_message"
    );
  }

  isChannelPost(): this is EventData<Update["channel_post"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "channel_post"
    );
  }

  isEditedChannelPost(): this is EventData<Update["edited_channel_post"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "edited_channel_post"
    );
  }

  isMessageReaction(): this is EventData<Update["message_reaction"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "message_reaction"
    );
  }

  isMessageReactionCount(): this is EventData<
    Update["message_reaction_count"]
  > {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "message_reaction_count"
    );
  }

  isInlineQuery(): this is EventData<Update["inline_query"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "inline_query"
    );
  }

  isChosenInlineResult(): this is EventData<Update["chosen_inline_result"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "chosen_inline_result"
    );
  }

  isCallbackQuery(): this is EventData<Update["callback_query"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "callback_query"
    );
  }

  isShippingQuery(): this is EventData<Update["shipping_query"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "shipping_query"
    );
  }

  isPreCheckoutQuery(): this is EventData<Update["pre_checkout_query"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "pre_checkout_query"
    );
  }

  isPoll(): this is EventData<Update["poll"]> {
    return (
      "updateType" in this.eventData && this.eventData.updateType === "poll"
    );
  }

  isPollAnswer(): this is EventData<Update["poll_answer"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "poll_answer"
    );
  }

  isMyChatMember(): this is EventData<Update["my_chat_member"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "my_chat_member"
    );
  }

  isChatMember(): this is EventData<Update["chat_member"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "chat_member"
    );
  }

  isChatJoinRequest(): this is EventData<Update["chat_join_request"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "chat_join_request"
    );
  }

  isChatBoost(): this is EventData<Update["chat_boost"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "chat_boost"
    );
  }

  isRemovedChatBoost(): this is EventData<Update["removed_chat_boost"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "removed_chat_boost"
    );
  }
}

export { Container };
