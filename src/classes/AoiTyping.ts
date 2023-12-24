import { Context } from "../Context";
import { AoiClient } from "./AoiClient";
import { AoiManager } from "./AoiManager";
import { MessageError } from "./AoiError";
import { AwaitedEvent } from "../helpers/Awaited";
import { Context as EventContext } from "telegramsjs";
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
  message: (data: Message & EventContext<F>) => void;
  "message:text": (data: Message.TextMessage & EventContext<F>) => void;
  edited_message: (data: Message & Update.Edited & EventContext<F>) => void;
  channel_post: (data: Message & Update.Channel & EventContext<F>) => void;
  edited_channel_post: (data: Message & Update.Edited & Update.Channel) => void;
  inline_query: (data: InlineQuery & EventContext<F>) => void;
  callback_query: (data: CallbackQuery & EventContext<F>) => void;
  "callback_query:data": (
    data: CallbackQuery & { data: string } & EventContext<F>,
  ) => void;
  shipping_query: (data: ShippingQuery & EventContext<F>) => void;
  pre_checkout_query: (data: PreCheckoutQuery & EventContext<F>) => void;
  poll: (data: Poll & EventContext<F>) => void;
  poll_answer: (data: PollAnswer & EventContext<F>) => void;
  chat_member: (data: ChatMemberUpdated & EventContext<F>) => void;
  my_chat_member: (data: ChatMemberUpdated & EventContext<F>) => void;
  chat_join_request: (data: ChatJoinRequest & EventContext<F>) => void;
}

interface EventHandlers {
  timeout: (client: AoiClient, database: ValueDatabase) => void;
  awaited: (event: AwaitedEvent, data: unknown) => void;
  functionError: (
    client: AoiClient,
    EventContext: EventContext & AoiClient,
  ) => void;
  addTimeout: (EventContext: ValueDatabase) => void;
}

interface LibDataFunction {
  name: string;
  callback: (
    ctx: Context,
    event: EventContext,
    database: AoiManager,
    error: MessageError,
  ) => unknown;
}

type DataFunction =
  | {
      name: string;
      type: "aoitelegram";
      version?: string;
      params?: string[];
      code: string;
    }
  | {
      name: string;
      type?: "js";
      version?: string;
      callback:
        | string
        | ((
            ctx: Context,
            event: EventContext,
            database: AoiManager,
            error: MessageError,
          ) => unknown);
    };

type DataEvent = {
  listen: string;
  type: string;
  once?: boolean;
  code?: string;
  callback?: () => void;
};

type CombinedEventFunctions = EventHandlers & EventDataMap<Buffer>;

export { CombinedEventFunctions, LibDataFunction, DataFunction, DataEvent };
