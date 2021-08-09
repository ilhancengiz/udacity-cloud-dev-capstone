import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { deleteBook, getBookBydId } from "../../businessLogic/bookLogic";
import { createLogger } from "../../utils/logger";
import { getUserId } from "../utils";
import * as middy from "middy";

const logger = createLogger("deleteBook");
const XAWS = AWSXRay.captureAWS(AWS);
const s3 = new XAWS.S3({
  signatureVersion: "v4",
});

const bucketName = process.env.BOOKS_IMAGES_S3_BUCKET;

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId;
    const userId = getUserId(event);
    const book = await getBookBydId(userId, bookId);
    const isItemExists = !!book;

    if (!isItemExists) {
      logger.error(
        `${userId} attempted to delete non-existing book with id of : ${book}`
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

    await deleteBook(userId, bookId);

    if (book.attachmentUrl) {
      await deleteFromS3(bookId);
    }

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

async function deleteFromS3(bookId: string): Promise<void> {
  const params = {
    Bucket: bucketName,
    Key: bookId,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (err) {
    logger.error(`Cant delete image of book id : ${bookId}`, err);
  }
}
