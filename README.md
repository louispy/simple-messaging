# Simple Messaging

Simple Message APIs with NestJS

## Requirements/ Dependencies
- NodeJs v22+
- MongoDB
- Kafka
- Elasticsearch
- Redis

## Setup
1. Recommended nodejs version 22+
2. Run `npm install` to install dependencies
3. Create an {envname}.env file depending on current environment (NODE_ENV), i.e development.env for development and production.env for production
4. Run `npm run build` to build app into `dist` folder
5. Run `npm run start:prod` to run api server on production environment by default on port 3000 unless PORT is specified in environment variable.
6. Run `npm run start:prod:consumer` to run consumer on production environment
7. Run `npm run seed:admin:prod` to seed initial user with `superadmin` username and password from the env file.

## Additional Setups (Optional)
1. MongoDB: Make sure to create a database for the application. There are three collections: users, conversations, and messages. Apart from the primary keys, the messages collection may also be indexed on timestamps and conversationId for the get and search messages api, i.e 
```
db.createCollection("messages") // if collection doesn't exist yet
db.messages.createIndex({ conversationId: 1, timestamp: -1 })
```
2. Kafka: The config for auto topic generation is on in this application. However for a better control, the topic (default: simple-messaging.index-messages) may be created beforehand to setup the topic settings, i.e number of partitions, isr.
3. Elasticsearch: Although by default indices are created dynamically, the index can be initialized manually to define mappings before inserting documents, i.e
```
curl -X PUT "http://localhost:9200/messages" -H "Content-Type: application/json" -d '
{
  "mappings": {
    "properties": {
      "conversationId": { "type": "keyword" },
      "content": { "type": "text" },
      "createdBy": { "type": "keyword" },
      "updatedBy": { "type": "keyword" },
      "timestamp": { "type": "date" },
      "metadata": { "type": "object" }
    }
  }
}'
```
Depending on specific requirements, the mappings and queries may be adjusted. Since the main use case of elasticsearch for message searching is to search by terms, assume that content type text suffice. The search will use the "match" query to look for case-insensitive words.
However, if there's a requirement to match partial words, the query may be changed to use "wildcard" or "prefix" search while keeping in mind that it's less performant and much slower than a full word search with "match".

## Project Structure
The project follows default NestJS project structure style, in modules with dependency injections pattern.
The modules are created with nest-cli generate command.
The coupling between modules are minimized.

## Components

### API
- POST /v1/auth/login
- POST /v1/users
- POST /v1/messages
- POST /v1/conversations
- GET /v1/conversations/:id/messages
- GET /v1/conversations/:id/messages/search
- Authorization with Bearer Token
- Postman collection is included in this repo


### Consumer
- index message topic

### Seeder
- admin user seeder

## Flow
1. With the `superadmin` user, the create user api POST /v1/users is accessible
2. POST /v1/conversations api can be used to create a new `conversation`
3. POST /v1/messages api use the `conversationId` from the create conversations api response as request payload and will create message and publish a message for message indexing to kafka
4. The index message kafka consumer will try to index with elasticsearch api (max retries = 3 by default)
5. GET /v1/conversations/:id/messages api can be used to retrieve messages from MongoDB
6. GET /v1/conversations/:id/messages/search api can be used to retrieve messages from elasticsearch with full text search query of the content


## Docker

```
docker build -t simple-messaging .
```