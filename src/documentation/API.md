---
title: API
layout: doc.ejs
order: 10
---

# API

Contentjet's API is self-documenting by exposing [Swagger UI](SwaggerUI) at the path `/swagger/` on your install of [contentjet-api](https://github.com/contentjet/contentjet-api) e.g. _https://api.yourdomain.com/swagger/_. This allows you to interactively browse the various endpoints provided by the API.

![](/images/swagger.png)

Alternatively, advanced users may wish to access the raw JSON [Open API 3 specification](https://github.com/OAI/OpenAPI-Specification) at the path `/spec` e.g. _https://api.yourdomain.com/spec_.

## Authentication

Most endpoints exposed via the API require authentication. Contentjet adheres to the **OAuth 2.0 Authorization Framework** and provides two ways of authenticating.

### Resource Owner Password Credentials Grant

The [Resource Owner Password Credentials Grant](https://tools.ietf.org/html/rfc6749#section-4.3) flow is used when authenticating with the backend as a User. This is useful if you need to _write_ data to the API. Note this is the flow contentjet-ui uses when you enter your email and password into the login form!

Request:

```bash
curl -H "Content-Type: application/json" \
  -d '{"username":"johnsmith@example.com","password":"mypassword","grant_type":"password"}' \
  https://api.yourdomain.com/authenticate
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUxOTc4OTcwNiwiZXhwIjoxNTE5NzkyNzA2fQ.yYbuJ7m4u_PxyeIDw0TbAHko-cdyh0iVkUtd6hRJDAA",
  "token_type": "bearer",
  "expires_in": 300,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUxOTc4OTcwNiwiZXhwIjoxNTE5NzkyNzA2fQ.yYbuJ7m4u_PxyeIDw0TbAHko-cdyh0iVkUtd6hRJDAA"
}
```

The authentication response contains `access_token` which is a [JWT](JWT) identifying the authenticated user. The access token is used by adding it as the `Authorization` header when making requests to secure endpoints e.g.

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUxOTc4OTcwNiwiZXhwIjoxNTE5NzkyNzA2fQ.yYbuJ7m4u_PxyeIDw0TbAHko-cdyh0iVkUtd6hRJDAA" \
  https://api.yourdomain.com/user/me
```

#### Refreshing the access token

For security reasons access tokens have a short lifespan and expire after only a few minutes. In order to stay authenticated with the API an access tokens must be refreshed before it expires by submitting the `refresh_token` to the `/user/token-refresh` endpoint.

```bash
curl -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUxOTc4OTcwNiwiZXhwIjoxNTE5NzkyNzA2fQ.yYbuJ7m4u_PxyeIDw0TbAHko-cdyh0iVkUtd6hRJDAA" \
  -d '{"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUxOTc4OTcwNiwiZXhwIjoxNTE5NzkyNzA2fQ.yYbuJ7m4u_PxyeIDw0TbAHko-cdyh0iVkUtd6hRJDAA","grant_type":"refresh_token"}' \
  https://api.yourdomain.com/token-refresh
```

You may have noticed the `access_token` and `refresh_token` are identical. While this is true, it's recommended you keep an explicit reference to the `refresh_token` separate from the `access_token` and only send the `refresh_token` value to the token refresh endpoint.

### Client Credentials Grant

The [Client Credentials Grant](https://tools.ietf.org/html/rfc6749#section-4.4) flow is used when authenticating with the backend as a Client. This form of authentication grants read-only access to the entire project the Client was created under.

To use this flow you must have first created a Client in your project. This can be done via the UI by going to **Project Settings** then **API**. Note only users with admin rights to the project will be able to create Clients.

Once you have created a Client you can use the **clientId** and **clientSecret** to authenticate. Be sure to change `<your-project-id>` in the URL to the id of your project.

Request:

```bash
curl -H "Content-Type: application/json" \
  -d '{"client_id":"39a469c6a2ea471392af28b9b0610c5f","client_secret":"d46b7cce50c2498ba93bd7d44e4d4432","grant_type":"client_credentials"}' \
  https://api.yourdomain.com/project/<your-project-id>/client/authenticate
```

Response:

```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6MSwiYXVkIjoiZDQ2YjdjY2U1MGMyNDk4YmE5M2JkN2Q0NGU0ZDQ0MzIiLCJpYXQiOjE1Mjg3MTcxMjAsImV4cCI6MTUyODcyMDcyMH0.FI3v0fsglCYImPR2O_qT38rRGN24zq9vvKNwoD3lIE4",
    "token_type": "bearer",
    "expires_in": 3600
}
```

The authentication response contains `access_token` which is a [JWT](JWT) identifying the authenticated Client. The access token is used by adding it as the `Authorization` header when making requests to secure endpoints e.g.

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUxOTc4OTcwNiwiZXhwIjoxNTE5NzkyNzA2fQ.yYbuJ7m4u_PxyeIDw0TbAHko-cdyh0iVkUtd6hRJDAA" \
  https://api.yourdomain.com/project/<your-project-id>/entry-type/
```

#### Refreshing the access token

Unlike the _Resource Owner Password Credentials Grant_ flow, this flow does not support refreshing the token.


[SwaggerUI]: https://swagger.io/swagger-ui/
[JWT]: https://jwt.io/
