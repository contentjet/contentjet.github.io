---
title: API
layout: doc.ejs
order: 10
---

# API

Contentjet's API is self documenting by exposing an [Open API 3 specification](https://github.com/OAI/OpenAPI-Specification). The specification can be found at the path `/spec` on your install of [contentjet-api](https://github.com/contentjet/contentjet-api) e.g _https://api.yourdomain.com/spec_. Readers are encouraged to visit [swagger.io](https://swagger.io/) for information around Open API tooling, specifically [Swagger UI](SwaggerUI) for generating documentation from the specification.

_TIP: You can paste the URL to your `/spec` endpoint in the Live Demo of [Swagger UI](SwaggerUI) to see rendered API docs._

## Authentication

Most endpoints exposed via the API require authentication. Contentjet adheres to the **OAuth 2.0 Authorization Framework** specifically the [Resource Owner Password Credentials Grant](OAuth) flow.

Request:

```bash
curl -H "Content-Type: application/json" \
  -d '{"username":"johnsmith@example.com","password":"mypassword","grant_type":"password"}' \
  https://api.yourdomain.com/user/authenticate
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

### Refreshing an access token

For security reasons access tokens have a short lifespan and expire after only a few minutes. In order to stay authenticated with the API an access tokens must be refreshed before it expires by submitting the `refresh_token` to the `/user/token-refresh` endpoint.

```bash
curl -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUxOTc4OTcwNiwiZXhwIjoxNTE5NzkyNzA2fQ.yYbuJ7m4u_PxyeIDw0TbAHko-cdyh0iVkUtd6hRJDAA" \
  -d '{"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUxOTc4OTcwNiwiZXhwIjoxNTE5NzkyNzA2fQ.yYbuJ7m4u_PxyeIDw0TbAHko-cdyh0iVkUtd6hRJDAA","grant_type":"refresh_token"}' \
  https://api.yourdomain.com/user/token-refresh
```

You may have noticed the `access_token` and `refresh_token` are identical. While this is true, it's recommended you keep an explicit reference to the `refresh_token` separate from the `access_token` and only send the `refresh_token` value to the token refresh endpoint.


[SwaggerUI]: https://swagger.io/swagger-ui/
[OAuth]: https://tools.ietf.org/html/rfc6749#section-4.3
[JWT]: https://jwt.io/
