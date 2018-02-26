---
title: API
layout: doc.ejs
order: 10
---

# API

Contentjet's API is self documenting by exposing an [Open API 3 based specification](https://github.com/OAI/OpenAPI-Specification). The specification can be found at the path `/spec` on your install of [contentjet-api](https://github.com/contentjet/contentjet-api) e.g _https://api.yourdomain.com/spec_. Readers are encouraged to visit [swagger.io](https://swagger.io/) for information around Open API tooling, specifically [Swagger UI](Swagger UI) for generating documenation from the specification (TIP: You can paste the URL to your `/spec` endpoint in the _Live Demo_ of [Swagger UI](Swagger UI) to see render API docs).

## Authentication

For _most_ endpoints exposed via the API authentication is required. Contentjet adheres to the **OAuth 2.0 Authorization Framework** specifically the [Resource Owner Password Credentials Grant](OAuth) flow.

[Swagger UI]: https://swagger.io/swagger-ui/
[OAuth]: https://tools.ietf.org/html/rfc6749#section-4.3
