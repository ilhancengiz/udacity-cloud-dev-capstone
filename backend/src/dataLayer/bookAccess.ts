import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);

import { Book } from "../models/Book";
import { BookUpdate } from "../models/BookUpdate";

export class BookAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly booksTable = process.env.BOOKS_TABLE,
    private readonly booksUserIdIndex = process.env.BOOKS_USERID_INDEX
  ) {}

  async getBooksByUser(userId: string): Promise<Book[]> {
    const queryParams = {
      TableName: this.booksTable,
      IndexName: this.booksUserIdIndex,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    const result = await this.docClient.query(queryParams).promise();
    return result.Items as Book[];
  }

  async getBookBydId(userId: string, bookId: string): Promise<Book> {
    const getParams = {
      TableName: this.booksTable,
      Key: {
        userId: userId,
        bookId: bookId,
      },
    };

    const result = await this.docClient.get(getParams).promise();
    return result.Item as Book;
  }

  async addNewBook(item: Book): Promise<Book> {
    const createParams = {
      TableName: this.booksTable,
      Item: item,
    };

    await this.docClient.put(createParams).promise();
    return item;
  }

  async deleteBook(userId: string, bookId: string): Promise<void> {
    const deleteParams = {
      TableName: this.booksTable,
      Key: {
        userId: userId,
        bookId: bookId,
      },
    };

    await this.docClient.delete(deleteParams).promise();
  }

  async updateBook(
    userId: string,
    bookId: string,
    updatedBook: BookUpdate
  ): Promise<void> {
    const updateParams = {
      TableName: this.booksTable,
      Key: {
        userId: userId,
        bookId: bookId,
      },
      UpdateExpression:
        "set #name = :bookName, #read = :isBookRead, dueDate = :dueDate",
      ExpressionAttributeNames: {
        "#name": "name",
        "#read": "read",
      },
      ExpressionAttributeValues: {
        ":bookName": updatedBook.name,
        ":isBookRead": updatedBook.read,
        ":dueDate": updatedBook.dueDate,
      },
    };
    await this.docClient.update(updateParams).promise();

    return;
  }

  async updateBookImage(
    userId: string,
    bookId: string,
    imageUrl: string
  ): Promise<void> {
    const updateImageParams = {
      TableName: this.booksTable,
      Key: {
        userId: userId,
        bookId: bookId,
      },
      UpdateExpression: "set attachmentUrl = :imageUrl",
      ExpressionAttributeValues: {
        ":imageUrl": imageUrl,
      },
    };
    await this.docClient.update(updateImageParams).promise();
    return;
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log("Creating a local DynamoDB instance");
    return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}
