# Authentication

## What is Authentication

Authentication means identifying a client's identity. who the client is. The system can have authentication but the important part is how secured is it.

We will discuss about how can we make our Authentication Secured.

## TLS (Not optional)

We have to communicate with the API through https without it everything is plain text and man in the middle can intercept and can see what are the information are passing throguh like username,password. So using TLS is not an option its mandatory

## Bearer Token Authentication

A basic authentication like encoding the username and password is real vulnerability we should never do this.

We can do something like this:

1. User sends request using username,password
2. Server checks in DB
3. Server returns a token
4. Client saves that token
5. On next request client send that token using a http header like `Authorization: "Bearer ${token}"`

### Problems with Bearer Token

One of the biggest problem with bearer token is it can be theft and if the token does not have any expiry time it can make a lot of damages to the account. So expiry time is must. So the right pattern is with short lived access token with rotation of refresh token.

## JWT - Json Web Token

JWTs are a specific format for bearer tokens. They are self contained tokens that carry claims about the user. the token is signed with a secret from server so the server does not need to ask to the db.

## Session based token

So the Session based token with a successfull login server creates a session an unique ID is associated with the user and sent in the cookies so subsequent request will automatically attach the session with the cookie.

The problem with session based token is with distributed multiple server needs to track the session for that user. which leads to manage a centralized store system for the session managment thats why it is often suggested to use JWTs with refresh token pattern.

## Token Rotation

Due to Access Token short lived implementation user may often get logged out on that case user need a new access token so when client first get the unauthorized status client understands that the access token has expired and hit the /refresh endpoint with old refresh token and server validates the refresh token and provides the new access token and refresh.

replacing the old refresh token and generating a new access token is known as rotation

## Cookies

As we will store refresh token to our cookies it is needed to store cookie safely so that we can prevent XSS attack so there are some mechanism to make the cookie safe.

- **Secure:** the cookie is only sent over https
- **HttpOnly:** JavaScript and document will not have the access of cookie so it prevents the Cross-Site-Scripting.
- **SameSite:** Controls whether the cookies will sent on cross site request
  - **Strict:** Only sent if the user is only on originating site
  - **Lax:** Sent on top level navigation the link embedded on image , form on that case cookies are blocked

# Authorization

## What is authorization?

Authorization means what are the access do you have as an user. After confirming the authentication based on the user role some actions are permissible and some actions are not

There are some ways to implement Authorization.

## RBAC (Role Based Access Control)

Role based access control is user sign up and gets a role like admin , editor , manager this kind and based on role some actions they can perform where as role like owner or super admin can usually do every action.

## ABAC (Attributes Based)

This is more of an advance based access control and decide whether a particular action is accessible or not decide basically by 4 attributes:

1. Subject(who): Role of the user requesting the access.

2. Resource(What): What resource are trying to access

3. Action(The How): What kind of action an user is trying to do over a resource.

4. Environment(The Context): decides based on location , ip address , time


## OAUTH2/OIDC
