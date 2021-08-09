export interface Book {
  userId: string;
  bookId: string;
  createdAt: string;
  name: string;
  author: string;
  dueDate: string;
  read: boolean;
  attachmentUrl?: string;
}
