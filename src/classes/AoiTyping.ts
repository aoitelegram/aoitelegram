import type { AoiClient } from "./AoiClient";
import type { AoiManager } from "./AoiManager";
import type { Container, Context } from "./core/";
import type { Context as EventContext, IEventFunctions } from "telegramsjs";
import type { ValueDatabase } from "../helpers/manager/TimeoutManager";
import {
  Update,
  UserFromGetMe,
  Message,
  MessageReactionUpdated,
  MessageReactionCountUpdated,
  CallbackQuery,
  InlineQuery,
  ShippingQuery,
  PreCheckoutQuery,
  Poll,
  PollAnswer,
  ChatMemberUpdated,
  ChatJoinRequest,
  MessageEntity,
  ChatBoostUpdated,
  ChatBoostRemoved,
} from "@telegram.ts/types";

interface CaptionableMessage {
  caption: string;
  caption_entities?: MessageEntity[];
}

interface AwaitedEvent {
  awaited: string;
  milliseconds: number;
  data: string;
  code: string;
}

interface EventHandlers extends IEventFunctions {
  timeout: (client: AoiClient, database: ValueDatabase) => void;
  awaited: (event: AwaitedEvent, data: unknown) => void;
  functionError: (
    client: AoiClient,
    eventContext: EventContext & { telegram: AoiClient },
  ) => void;
  addTimeout: (eventContext: ValueDatabase) => void;
}

type DataFunction =
  | {
      name: string;
      type: "aoitelegram";
      version?: string;
      brackets?: boolean;
      useNative?: Function[];
      params?: string[];
      code: string;
    }
  | {
      name: string;
      type?: "javascript";
      brackets?: boolean;
      fields?: { name?: string; required: boolean };
      optional?: boolean;
      version?: string;
      callback: (
        container: Container,
        context: Context,
      ) => {
        id: string;
        replace: string;
        with: string;
      };
    };

type ContextEvent = EventContext &
  UserFromGetMe &
  Message &
  MessageReactionUpdated &
  MessageReactionCountUpdated &
  CallbackQuery &
  InlineQuery &
  ShippingQuery &
  PreCheckoutQuery &
  Poll &
  PollAnswer &
  ChatMemberUpdated &
  ChatJoinRequest &
  ChatBoostUpdated &
  ChatBoostRemoved & { telegram: AoiClient };

type DataEvent = {
  listen: string;
  type: string;
  once?: boolean;
  code?: string;
  useNative?: Function[];
  callback?: (...args: any[]) => void;
};

export { EventHandlers, ContextEvent, DataFunction, DataEvent };
