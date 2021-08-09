import "source-map-support/register";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";

import { AddNewBookRequest } from "../../requests/AddNewBookRequest";
import { addNewBook } from "../../businessLogic/bookLogic";
import { getUserId } from "../utils";

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const newBook: AddNewBookRequest = JSON.parse(event.body);
  const userId = getUserId(event);
  const newItem = await addNewBook(newBook, userId);

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      item: newItem,
    }),
  };
};
