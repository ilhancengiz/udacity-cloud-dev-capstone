import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { UpdateBookRequest } from "../../requests/UpdateBookRequest";
import { getBookBydId, updateBook } from "../../businessLogic/bookLogic";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";
import * as middy from "middy";

const logger = createLogger("updateBook");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId;
    const userId = getUserId(event);
    const book = await getBookBydId(userId, bookId);
    const isItemExists = !!book;

    if (!isItemExists) {
      logger.error(
        `${userId} attempted to update non-existing book with id of : ${bookId}`
      );
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          error: `${bookId} book not exists.`,
        }),
      };
    }

    const updatedBook: UpdateBookRequest = JSON.parse(event.body);

    await updateBook(userId, bookId, updatedBook);

    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "",
    };
  }
);
