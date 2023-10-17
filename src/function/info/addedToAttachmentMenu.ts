import { DataFunction } from "context";

const data: DataFunction = {
  name: "$addedToAttachmentMenu",
  callback: async (ctx, event, database, error) => {
    const addedToAttachmentMenu = event.from.added_to_attachment_menu ?? event.message?.from.added_to_attachment_menu;
    return addedToAttachmentMenu || null;
  },
};

export { data };