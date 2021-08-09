# Serverless Book List

# Functionality of the application

This application will allow creating/removing/updating/fetching users' custom books. Each book can optionally have an attachment image. Each user only has access to books that he/she has created.

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless application.
