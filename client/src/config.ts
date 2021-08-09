// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = "fn9hb3fyb0";
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`;

export const authConfig = {
  domain: "dev-ejy0jw3j.us.auth0.com", // Auth0 domain
  clientId: "S0pqGEW7IslGwekS9xvFplwMegOm1YPE", // Auth0 client id
  callbackUrl: "http://localhost:3000/callback",
};
