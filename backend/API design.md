# What do you understand about REST API?

REST API full form is Representational State Transfer. An API is called RESTful when it follows the core principles of being a RESTful API. The principles are:

## 1. Client Server Architecture

Client and server are completely different and isolated component so that server does not need to think about client and can serve multiple client if it is needed to be.

## 2. Stateless Architecture

Server does not store any information about client. client always have to attach necessary information with header.

## 3. Should use proper Http Method

- GET - Retrieve a resource
- POST - Create a new resource
- PUT - Update a resource
- DELETE - delete a resource

## 4. Implement Status Code correctly

- 200 - Ok
- 201 - Created
- 400 - Bad request
- 404 - Not found
- 403 - Forbidden
- 500 - Internal Server Error

## 5. Secure API

1. Implement authentication & authorization
2. Validate input data prevent sql injection
3. Implement Rate Limiting

## 6. Use pagination for large datasets

Fetching large amounts of data on a single fetch could be inefficient and can misused by the client so its better to use pagination.

## 7. Implement versioning

Implement versioning on API ensures that any breaking changes can always fallback to the previous version of the API.

## 8. Optimize REST APIs using caching

We can cache our API using cache-control header to optimize our API and also we can save a unnecessary db call.

## 9. Use Idempotency

Idempotency is very important for sensitive endpoints like ordering or for a payment API. Idempotent means doing one operation or multiple operation will have same affect. its very important to use idempotent-key for POST API. Client sends a unique token to the http header like idempotent-key if a network is timedout and client retries it then server checks it if the same idempotent-key or not if it is then reject the new one.

## Summary

So here is the summary of REST API:

**Core principles:**

1. Client Server Architecture
2. Stateless
3. Proper noun based naming convention
4. Http Status Code
5. Http Method
6. communicating with state like json format

**To make it Scalable:**

1. Robust Error handling
2. Secured API (handling proper Authentication and Authorization)
3. Validating the Input
4. Use of Idempotent-key
