export default {
  name: "$isAddedToAttachmentMenu",
  callback: (context) => {
    const addedToAttachmentMenu =
      context.event.from?.added_to_attachment_menu ||
      context.event.message?.from.added_to_attachment_menu ||
      context.event.user?.added_to_attachment_menu;
    return addedToAttachmentMenu;
  },
};
