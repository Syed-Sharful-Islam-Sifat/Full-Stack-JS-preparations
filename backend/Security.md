# SQL Injection

SQL injection is attacker inject sql through form and database's SQL consider this input from attacker as SQL instead of input value which results giving information to the attackers.

For example let say for a feature we need to get users whose email is a given input value.

```sql
SELECT * FROM users WHERE email  = "alice@gmail.com"
```

so that will return all the users whose email is alice@gmail.com

Now how the attacker will try to use the weakness of this SQL writing let see.

```sql
SELECT * FROM users WHERE email  = '' OR '1' = '1' --'
```

so here attacker given input as `' OR '1' = '1' --'`

it is saying give users whose email is empty string or '1'='1' which is always true so that gives all the emails.

How do we prevent this kind of attack answer is:

## Parameterized Queries

So parameterized queries main idea is to separate the actual database statement and input

so here statement = `SELECT * FROM users WHERE email  = '$1`

```js
DB.query(statement, userInput);
```

Now we have separated the statement and user input.

# Cross-Site Scripting (XSS)

Cross-Site-Scripting is executing malicious code to a site faking as it is the part of the site.

### What an XSS attack can do?

1. Access or modify all the content of the site loaded pages and any content in localstorage
2. Make Http requests with the user's credentials and impersonate the user and getting the sensitive information of the user

All XSS attack depends on a website doing two things:

1. Accepting some input that could have been crafted by an attacker.
2. Execute JavaScript code by taking the advantage of weakness of proper sanitizing.

## Code-Injection in browser

suppose there is a site name bank.com and the one of the page of the site is bank.com/welcome?user=${username} takes a parameter and page shows

```js
const params = new URLSearchParams(window.location.search);
const user = params.get("user");
const welcome = document.querySelector("#welcome");

welcome.innerHTML = `Welcome back, ${user}!`;
```

now attacker wants any javascript code to be injected so he could do something like this

```html
<a
  href="https://my-bank.example.com/welcome?user=<img src=x onerror=alert('hello!')>">
  Get a free kitten!</a
>
```

thats what happens:

1. The browser loads the page
2. The page extracts the URL parameter named user, whose value is `<img src=x onerror=alert("hello!")>`
3. then on welcome innerHtml assigned the value which creates a `<img>` html tag
4. but src attributes create an error which

# Code Injection in server

```html
<h1>Search</h1>

<form action="/results">
  <label for="mySearch">Search for an item:</label>
  <input id="mySearch" type="search" name="search" />
  <input type="submit" />
</form>
```

so this is a search form user gives a GET request to server and in return get list as a result. but how this can turn into a vulnerability?

```js
app.get("/results", (req, res) => {
  const searchQuery = req.query.search;
  const results = getResults(searchQuery); // Implementation not shown
  res.send(`
   <h1>You searched for ${searchQuery}</h1>
   <p>Here are the results: ${results}</p>`);
});
```

instead of happy path you can pass whatever you want like a html code and without proper validation server will execute that code

```html
<a href="http://example.org/results?search=<img src=x onerror=alert('hello')">
  Get a free kitten!</a
>
```

1. The browser sends a GET request to the server.
2. server get search parameter
3. execute the malicious code

# Defenses agains XSS attack

There are two main defenses against XSS attack.

1. Use output encoding and sanitization to prevent input becoming executable In JavaScript you can manually write sanitize but modern framework like React has default safe text mode.
2. Use CSP(Conent-Security-Policy) to tell browser which JavaScript or CSS resources it should allowed to execute

# Cross Site Request Forgery (CSRF)

In a cross site request forgery attack the attacker tricks user to send a malicious attack from hacker site to the target site the request includes the user's credential and causes the server to execute some harmful action.

Let say attacker create a form submitting form will redirect to the transfer api that will transfer some amount to another account as user will be redirected to his bank account so the endpoint will be hitted by user's credential and can damage the user's account.

## Defenses against CSRF token

1. The first primary way of handling this attack is to use CSRF tokens embedded in the page
2. The second is to use Fetch metadata HTTP headers to check where actually the request came from

## CSRF Tokens

In this defense when the server serves a page it embeds an unpredictable value in the page called CSRF token When legitemate page. So how it happens

1. Server generates a CSRF token and and embed that csrf token as hidden input
2. User submits the form with csrf token
3. Request comes to server with attaching csrf token in body.
4. server validates the token and now remove it from the memory and serve to the client

So that single csrf token can't be used once it has been used.

## Fetch Metadata

Fetch metadata is colletion of http headers that gives some extra information about the request. in that case the most useful could be Sec-fetch-site it checks from which origin or site the request comes from based on that we can block a request.

## SameSite Cookie

Samesite:Strict cookie is the topmost protection against CSRF token. it does not allow any cross site request to the actual site. but hampers the usability.

Samesite:lax It relaxes the restriction but much weaker than strict

It allows cross site request if:

1. it is a GET request for POST it blocks the request
2. The request was a navigation of the top-level browsing context.
