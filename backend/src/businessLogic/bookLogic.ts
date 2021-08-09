import * as uuid from "uuid";

import { Book } from "../models/Book";
import { BookAccess } from "../dataLayer/bookAccess";
import { AddNewBookRequest } from "../requests/AddNewBookRequest";
import { UpdateBookRequest } from "../requests/UpdateBookRequest";

const bookAccess = new BookAccess();

export async function getBooksByUser(userId: string): Promise<Book[]> {
  return bookAccess.getBooksByUser(userId);
}

export async function getBookBydId(
  userId: string,
  bookId: string
): Promise<Book> {
  return bookAccess.getBookBydId(userId, bookId);
}

export async function addNewBook(
  addNewBookRequest: AddNewBookRequest,
  userId: string
): Promise<Book> {
  const itemId = uuid.v4();

  return bookAccess.addNewBook({
    bookId: itemId,
    userId: userId,
    read: false,
    name: addNewBookRequest.name,
    author: addNewBookRequest.author,
    dueDate: addNewBookRequest.dueDate,
    createdAt: new Date().toISOString(),
  });
}

export async function updateBook(
  userId: string,
  bookId: string,
  updateBookRequest: UpdateBookRequest
): Promise<void> {
  return bookAccess.updateBook(userId, bookId, {
    name: updateBookRequest.name,
    author: updateBookRequest.author,
    read: updateBookRequest.read,
    dueDate: updateBookRequest.dueDate,
  });
}

export async function updateBookImage(
  userId: string,
  bookId: string,
  imageUrl: string
): Promise<void> {
  return bookAccess.updateBookImage(userId, bookId, imageUrl);
}

export async function deleteBook(
  userId: string,
  bookId: string
): Promise<void> {
  return bookAccess.deleteBook(userId, bookId);
}
