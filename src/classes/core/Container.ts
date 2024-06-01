import { AoiBase } from "../AoiBase";
import type { AoiClient } from "../AoiClient";
import type { AoiManager } from "../AoiManager";
import type { Update } from "@telegram.ts/types";
import type { SuccessCompiler } from "./Compiler";
import { Collection } from "@telegram.ts/collection";
import { ConditionChecker, WordMatcher } from "../../utils/";
import type { ContextEvent, CommandData } from "../AoiTyping";

type EventData<T> = { eventData: T } & Container;

type UpdateHandler = Required<Update>;

class Container {
  public readonly array: Collection<string, any[]> = new Collection();
  public readonly object: Collection<string, object> = new Collection();
  public readonly random: Collection<any, number> = new Collection();
  public readonly variable: Collection<any, any> = new Collection();
  public readonly condition: typeof ConditionChecker = ConditionChecker;
  public readonly wordMatcher: typeof WordMatcher = WordMatcher;
  public suppressErrors: string | null = null;
  public readonly eventData: ContextEvent;
  public readonly telegram: AoiClient;
  public readonly database: AoiManager;
  public stopCode: boolean = false;

  constructor(
    ctx: ContextEvent,
    public readonly command: CommandData & SuccessCompiler,
  ) {
    this.eventData = ctx;
    this.telegram = (ctx instanceof AoiBase
      ? ctx
      : ctx?.api instanceof AoiBase
        ? ctx.api
        : {}) as unknown as AoiClient;
    this.database = this.telegram.database;
  }

  setSuppressErrors(reason: string | null): Container {
    this.suppressErrors = reason;
    return this;
  }

  isMessage(): this is EventData<UpdateHandler["message"]> {
    return (
      "updateType" in this.eventData && this.eventData.updateType === "message"
    );
  }

  isEditedMessage(): this is EventData<UpdateHandler["edited_message"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "edited_message"
    );
  }

  isChannelPost(): this is EventData<UpdateHandler["channel_post"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "channel_post"
    );
  }

  isEditedChannelPost(): this is EventData<
    UpdateHandler["edited_channel_post"]
  > {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "edited_channel_post"
    );
  }

  isBusinessConnection(): this is EventData<
    UpdateHandler["business_connection"]
  > {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "business_connection"
    );
  }

  isBusinessMessage(): this is EventData<UpdateHandler["business_message"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "business_message"
    );
  }

  isEditedBusinessMessage(): this is EventData<
    UpdateHandler["edited_business_message"]
  > {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "edited_business_message"
    );
  }

  isDeletedBusinessMessages(): this is EventData<
    UpdateHandler["deleted_business_messages"]
  > {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "deleted_business_messages"
    );
  }

  isMessageReaction(): this is EventData<UpdateHandler["message_reaction"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "message_reaction"
    );
  }

  isMessageReactionCount(): this is EventData<
    UpdateHandler["message_reaction_count"]
  > {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "message_reaction_count"
    );
  }

  isInlineQuery(): this is EventData<UpdateHandler["inline_query"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "inline_query"
    );
  }

  isChosenInlineResult(): this is EventData<
    UpdateHandler["chosen_inline_result"]
  > {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "chosen_inline_result"
    );
  }

  isCallbackQuery(): this is EventData<UpdateHandler["callback_query"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "callback_query"
    );
  }

  isShippingQuery(): this is EventData<UpdateHandler["shipping_query"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "shipping_query"
    );
  }

  isPreCheckoutQuery(): this is EventData<UpdateHandler["pre_checkout_query"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "pre_checkout_query"
    );
  }

  isPoll(): this is EventData<UpdateHandler["poll"]> {
    return (
      "updateType" in this.eventData && this.eventData.updateType === "poll"
    );
  }

  isPollAnswer(): this is EventData<UpdateHandler["poll_answer"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "poll_answer"
    );
  }

  isMyChatMember(): this is EventData<UpdateHandler["my_chat_member"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "my_chat_member"
    );
  }

  isChatMember(): this is EventData<UpdateHandler["chat_member"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "chat_member"
    );
  }

  isChatJoinRequest(): this is EventData<UpdateHandler["chat_join_request"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "chat_join_request"
    );
  }

  isChatBoost(): this is EventData<UpdateHandler["chat_boost"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "chat_boost"
    );
  }

  isRemovedChatBoost(): this is EventData<UpdateHandler["removed_chat_boost"]> {
    return (
      "updateType" in this.eventData &&
      this.eventData.updateType === "removed_chat_boost"
    );
  }
}

export { Container };
