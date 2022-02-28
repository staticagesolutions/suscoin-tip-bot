interface GroupChatI {
  chatId: bigint;
  title: string;
  updateAt: Date;
  createdAt: Date;
}
export type GroupChatWithoutDate = Omit<GroupChatI, "updateAt" | "createdAt">;
