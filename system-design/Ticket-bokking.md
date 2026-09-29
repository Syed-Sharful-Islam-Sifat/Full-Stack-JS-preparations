# Design a Ticket booking Sysyem

A ticket booking system is an online platform where user can book a ticket for sports event , concert etc.

# Functional Requirements
1. User can search for an event
2. User can see the seat arrangement
3. User pay for a seat and booked


# Non Functional Requirements

1. Search functionality need high availability
2. Book functionality need strong consistency(no double booking)
3. The system should be able to handle high throughput 10m users per event
4. System is read heavy (100:1)

# Core Entities
User
Event
ticket
booking
Venue
Performer

# API Design

GET /api/v1/search?event={eventName} -> will be provided the event

GET /api/v1/event/[eventId] -> event details with seat arrangement

POST /api/v1/booking/[eventId]
{
    ticketIds:[],
    paymentDetails
}

response-> successfull or not

# High Level Design

1. User should be able to view event

So when user will request for a specific event through eventdetails API. User should be able to see the event details with seat availability.

The flow will be:

User<->API Gateway<-> Event Service <-> DB

### API gateway:
 is responsible for authentication , rate limiting and correct routing.
### Event service:
 is one of the core components of microservice. so we need microservice here to handle massive request.

 ### Event DB:
 is responsible to store about the event information like event name , location , performer and seat arrangement.

 2. User should able to search for event.

 User will input about event name or keyword through search input and for a request system will give the list of events that matches with search criteria.




