import { KeyboardID } from "../index";
import { Keyboard } from "telegramsjs";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$addKeyboard")
  .setBrackets(true)
  .setFields({
    name: "index",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "type",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "other",
    rest: true,
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [index, type, ...other] = await func.resolveFields(context);
    const markup = context.variable.get(KeyboardID);

    switch (type) {
      case "text": {
        const [text] = other;
        markup[index - 1] ??= new Keyboard();
        markup[index - 1].text(text);
        context.variable.set(KeyboardID, markup);
        break;
      }
      case "requestUsers": {
        const [text, requestId, options] = other;
        markup[index - 1] ??= new Keyboard();
        markup[index - 1].requestUsers(text, requestId, options);
        context.variable.set(KeyboardID, markup);
        break;
      }
      case "requestChat": {
        const [text, requestId, options] = other;
        markup[index - 1] ??= new Keyboard();
        markup[index - 1].requestChat(text, requestId, options);
        context.variable.set(KeyboardID, markup);
        break;
      }
      case "requestContact": {
        const [text] = other;
        markup[index - 1] ??= new Keyboard();
        markup[index - 1].requestContact(text);
        context.variable.set(KeyboardID, markup);
        break;
      }
      case "requestLocation": {
        const [text] = other;
        markup[index - 1] ??= new Keyboard();
        markup[index - 1].requestLocation(text);
        context.variable.set(KeyboardID, markup);
        break;
      }
      case "requestPoll": {
        const [text, type] = other;
        markup[index - 1] ??= new Keyboard();
        markup[index - 1].requestPoll(text, type);
        context.variable.set(KeyboardID, markup);
        break;
      }
      case "webApp": {
        const [text, url] = other;
        markup[index - 1] ??= new Keyboard();
        markup[index - 1].webApp(text, url);
        context.variable.set(KeyboardID, markup);
        break;
      }
      default: {
        return func.reject(`Invalid type "${type}"`);
      }
    }

    return func.resolve();
  });
