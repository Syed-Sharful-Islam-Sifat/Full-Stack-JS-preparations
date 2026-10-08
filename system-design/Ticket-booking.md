# Design a Ticket booking Sysyem

A ticket booking system is an online platform where user can book a ticket for sports event , concert etc.

## Functional Requirements

1. User can search for an event
2. User can see the seat arrangement
3. User pay for a seat and booked

## Non Functional Requirements

1. Search functionality need high availability
2. Book functionality need strong consistency(no double booking)
3. The system should be able to handle high throughput 10m users per event
4. System is read heavy (100:1)

## Core Entities

- User
- Event
- ticket
- booking
- Venue
- Performer

## API Design

```
GET /api/v1/search?event={eventName} -> will be provided the event

GET /api/v1/event/[eventId] -> event details with seat arrangement

POST /api/v1/booking/[eventId]
{
    ticketIds:[],
    paymentDetails
}

response-> successfull or not
```

## High Level Design

### 1. User should be able to view event

So when user will request for a specific event through eventdetails API. User should be able to see the event details with seat availability.

The flow will be:

```
User <-> API Gateway <-> Event Service <-> DB
```

- **API gateway:** is responsible for authentication , rate limiting and correct routing.
- **Event service:** is one of the core components of microservice. so we need microservice here to handle massive request.
- **Event DB:** is responsible to store about the event information like event name , location , performer and seat arrangement.

### 2. User should able to search for event.

User will input about event name or keyword through search input and for a request system will give the list of events that matches with search criteria.

how the search will be implemented we will come to this point later. so the search will work like this.

1. Client sends a request to API gateway.
2. API gateway authenticate user and use rate limiter and also understand which service this request should go and route the request.
3. Search service understand the search criteria apply business logic and get the list of events through DB and return the results.

### 3. User should be able to book the event.

So one of the core requirements of booking an event is no seat should be booked by two person so we have to look for transactional or acid properties so there are DB that supports transaction but I want to go with SQL as it is more robust in terms of handling transaction we need to implement proper isolation like row-level-locking or optimistic Concurrency Control to fully prevent double bookings. so there will be two more tables in event db one is booking and another one is ticket.

**Booking Service:** This service is responsible for handling core functionality like creating booking for an event completion of the payment processing.

When user tries to book a ticket for an event the following things happen:

1. User clicks a button book and then UI takes payment details along with payment details hit a POST request /booking
2. A request came and API gateway checked authentication and ratelimiting understood wants to book and routed to the booking service
3. it checks if the event exists if it then uder transaction it does 4 things:
   1. look if seat is available
   2. lock the seat using row level lock or optimistic cocurrent
   3. create the booking details on booking table with payment status pending
   4. complete payment and update the booking table.

## Potential Deep Dives

### 1. How do we improve the booking experience by reserving tickets

Lets think about an experience with current setup: user has click the button book with selected seat and gave payment details but after checking from the db it see the seat is not available and thats a horrible performance for the user because after filling all the payment details they have been seeing the seat is not available so what could be the good solution.

**First start with bad solution:**
One of the common approach is long running database locks means if a transaction happens quickly the row locking is released and status is booked but if user takes time to cancel the purchase then it will be locked until the book does not cancel and no user that time can go for that particular ticket.

**One of the good solution** could be by adding a status "reserved" in ticket table and also expiration time so after the expiration the ticket status should rolled back to the available from "reserved" but how we would do this we can implement a cron job that will periodically checks the bookings with "reserved" status and rolled back to available if expiration time is passed but that solution has real drawbacks a booking management is sensitive if cron job fails the system can fail badly and also with cron job its not always possible to right after expiration changing the status which should be obvious behaviour.

**Great Solution:**
Instead of relying on cron job and to avoid that cron job delay we can come up with solution like checking if the status has been available or "reserved" with expiration time has been passed with this approach we don't fall into that delay this is a great idea.

**Another Great Solution (distributed lock with ttl):**

While traditional ACID transaction are great way to lock a row while others wont be able to update that row but not designed for large scale application for ticket master where thousands of user can fight for a single ticket handling that much user for a single resource where there is also limitations of connection pool so for that case redis or zookeeper are great where there is built in ttl means after expiration redis automatically releases the row. and redis are much faster to handle large amount of request.

So How redis do that? let say a request come with user id 42:

1. redis create a key with a ticketId(if the key does not exists) and maps it to user with id 42.
2. now at the same time another user came and tries to create that id but redis rejects the request as it is already accquire
3. case1: user purchased the ticket so on success application code releases the lock.
   case2: user is waiting and not being able to purchase the ticket after the expiration of ttl so exact moment after the expiration of ttl redis removes that key.

#### Challenges:

1. **Seat map reads:** locks lives in redis not in db. redis maintain a set of keys that are held which is different ds to show the seat map correctly but once the checkout is successfull or key is expired that does not remove the key from the set which is considered as ghost reserved and in the end can show wrong seat map. So one of the better solution is to maintain a time score with a ticketId and the set is sorted by time

   | items     | expire_time |
   | --------- | ----------- |
   | ticket123 | 10:10       |
   | ticket124 | 10:15       |

   so we can ask give me tickets whose expire time is greater than 10:12.

2. **Failure handling:**
   If the lock goes down still we won't have a problem of double booking problem beacuse we will use optimistic co-currency control which will give access of read but user still may get lock by the time of write but that still better than worst case scenario as there are two events needs to be happended once the lock or redis has to down and another one is another user has to confirm the purchasing.

3. **TTL expiration during payment:** it can happen user completes the paymant details and submits the payment button and that time ttl expired in that case as transaction ensure only one write succeeds so failing to write will trigger refund payment event

### 2. How is the View API is going to scale?

**Great Solution:** One of the best way to handling high read volume but less write volume data is to add caching. we have to add caching carefully. event details are not something that will be changed frequently so we can cache it heavily and also in memory storage are highly tolerant to handle many requests

we can use load balancer to distribute the traffic among multiple server instances.

### 3. How will the system ensure a good user experience during high-demand events with millions simultaneously booking tickets?

The events that are most popular millions of users can look for a ticket and without scaling this feature many user can face staleness means which ticket they choose and tries to confirm at last period they can see ticket is booked so what could be the solutions?

**Good Solution:**
To ensure that the seat map is always up to date we can use SSE (server sent events) to push updates to the client in real time so users will know instantly which are booked and which are not.

**challenges:**
this is good for moderate popular events but will suffer for high popular events

**Great Solution: Virtual waiting queue for extremely popular events**

1. When a user requests to view the booking page they are placed in a virtual queue. We establish a persistent connection with their client and add them to the queue. this queue can be backed by redis like sorted set.
2. deque from the set and notify user now they can purchase the ticket
3. also mark admitted to the users who had been given the access to see the bookings.

### 4. How can you ensure low latency on searching events:

**Bad solution:** we are going to search the event based on event name , venue or performer but this way we will end up scanning the full table for a popular site that will give much slower experience.

**Good Solution:** Create indexes on the event , performer and venues tables we know indexing is a good way to retrieve data faster.

**challenges:** indexing makes read faster but writes become slower

**Great Solution:** Full text indexes is a great way to implement search this is what powers the elastic search instead of searching documents to word. isn't it become much faster which documents hold that word? we get it instantly. Postgres has built in feature for full text index

**Complexities:** This requires additional space can make the search slower.

**Great solution (Elastic Search):** We can use elasticSearch or similar technology which are highly optimized to search the text internally elastic search uses inverted index means word->document mapping to find the documents that are responsible for that word which is highly optimize solution and also that does not create chaos to our PostgresSQL although we need to create synchronization with our SQL DB.
