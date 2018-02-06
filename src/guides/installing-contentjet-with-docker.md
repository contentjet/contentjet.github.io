---
title: Installing contentjet with Docker
layout: guide.ejs
---

# Installing contentjet with Docker

## Prerequisites

## Install Docker & Docker Compose

[How To Install and Use Docker on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)

[Install Docker Compose](https://docs.docker.com/compose/install/#install-compose)

## Configure Docker Compose

```
mkdir -p /opt/contentjet
```

```
version: '3.4'
services:
  db:
    image: postgres:9.6.2
    restart: always
    environment:
      POSTGRES_USER: yourdbuser
      POSTGRES_PASSWORD: yourdbpassword
      POSTGRES_DB: contentjet-api
  api:
    image: contentjet/contentjet-api:0.6.0
    restart: always
    environment:
      DB_HOST: db
      DB_USER: yourdbuser
      DB_PASS: yourdbpassword
      DB_NAME: contentjet-api
      SECRET_KEY: yoursupersecretkey
      NODE_ENV: production
      MAIL_BACKEND: mailgun
      MAILGUN_API_KEY: yourapikey
      MAILGUN_DOMAIN: yourdomain
      MAIL_FROM: noreply@yourdomain.com
      BACKEND_URL: https://api.yourdomin.com
      MEDIA_URL: https://media.yourdomin.com
      FRONTEND_URL: https://app.yourdomin.com
    volumes:
      - media:/opt/contentjet-api/media/
    ports:
      - "80:3000"
volumes:
  media:
```

## Generate certificates with Let's Encrypt
