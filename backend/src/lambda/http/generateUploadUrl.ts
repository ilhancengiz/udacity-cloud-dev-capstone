import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { getBookBydId, updateBookImage } from "../../businessLogic/bookLogic";
import { createLogger } from "../../utils/logger";
import { getUserId } from "../utils";
import * as middy from "middy";

const logger = createLogger("uploadUrl");
const XAWS = AWSXRay.captureAWS(AWS);

const s3 = new XAWS.S3({
  signatureVersion: "v4",
});

const bucketName = process.env.BOOKS_IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId;
    const userId = getUserId(event);
    const book = await getBookBydId(userId, bookId);
    const isItemExists = !!book;

    if (!isItemExists) {
      logger.error(
        `${userId} attempted to create upload url for non-existing book with id of : ${bookId}`
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

    const url = getUploadUrl(bookId);
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${bookId}`;
    await updateBookImage(userId, bookId, imageUrl);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        uploadUrl: url,
      }),
    };
  }
);

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration,
  });
}
