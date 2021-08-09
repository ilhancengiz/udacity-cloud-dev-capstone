export interface Book {
  bookId: string;
  createdAt: string;
  name: string;
  author: string;
  dueDate: string;
  read: boolean;
  attachmentUrl?: string;
}
