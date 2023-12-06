import { Context } from "telegramsjs";
import { AoiClient } from "./AoiClient";
import { AwaitedEvent } from "../helpers/Awaited";
import { ValueDatabase } from "../helpers/manager/TimeoutManager";
import {
  Update,
  UserFromGetMe,
  Message,
  CallbackQuery,
  InlineQuery,
  ShippingQuery,
  PreCheckoutQuery,
  Poll,
  PollAnswer,
  ChatMemberUpdated,
  ChatJoinRequest,
  MessageEntity,
} from "@telegram.ts/types";

interface CaptionableMessage {
  caption: string;
  caption_entities?: MessageEntity[];
}

interface EventDataMap<F> {
  update: (data: Update) => void;
  ready: (data: UserFromGetMe) => void;
  message: (data: Message & Context<F>) => void;
  "message:text": (data: Message.TextMessage & Context<F>) => void;
  edited_message: (data: Message & Update.Edited & Context<F>) => void;
  channel_post: (data: Message & Update.Channel & Context<F>) => void;
  edited_channel_post: (data: Message & Update.Edited & Update.Channel) => void;
  inline_query: (data: InlineQuery & Context<F>) => void;
  callback_query: (data: CallbackQuery & Context<F>) => void;
  "callback_query:data": (
    data: CallbackQuery & { data: string } & Context<F>,
  ) => void;
  shipping_query: (data: ShippingQuery & Context<F>) => void;
  pre_checkout_query: (data: PreCheckoutQuery & Context<F>) => void;
  poll: (data: Poll & Context<F>) => void;
  poll_answer: (data: PollAnswer & Context<F>) => void;
  chat_member: (data: ChatMemberUpdated & Context<F>) => void;
  my_chat_member: (data: ChatMemberUpdated & Context<F>) => void;
  chat_join_request: (data: ChatJoinRequest & Context<F>) => void;
}

interface EventHandlers {
  timeout: (client: AoiClient, database: ValueDatabase) => void;
  awaited: (event: AwaitedEvent, data: unknown) => void;
  functionError: (client: AoiClient, context: Context & AoiClient) => void;
}

type CombinedEventFunctions = EventHandlers & EventDataMap<Buffer>;

export { CombinedEventFunctions };
