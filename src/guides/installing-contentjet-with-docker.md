---
title: Installing contentjet with Docker
layout: guide.ejs
---

# Installing contentjet with Docker

## Prerequisites

## Install Docker & Docker Compose

[How To Install and Use Docker on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)

[Install Docker Compose](https://docs.docker.com/compose/install/#install-compose)

## Generate certificates with Let's Encrypt

```
docker run -it --rm \
  -v certs:/etc/letsencrypt \
  -v certs-data:/data/letsencrypt \
  certbot/certbot \
  certonly \
  --webroot --webroot-path=/data/letsencrypt \
  -d example.com \
  -d app.example.com \
  -d api.example.com \
  -d media.example.com
```

## Configure NGINX

```
http {

    ssl_session_cache         shared:SSL:20m;
    ssl_session_timeout       10m;

    ssl_protocols             TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_ciphers               "ECDH+AESGCM:ECDH+AES256:ECDH+AES128:!ADH:!AECDH:!MD5;";

    ssl_stapling              on;
    ssl_stapling_verify       on;

    resolver                  8.8.8.8 8.8.4.4;

    access_log                /dev/stdout;
    error_log                 /dev/stderr info;

    server {
        listen 80;
        server_name app.example.com;

        location / {
            return 301 https://$host$request_uri;
        }

        location ^~ /.well-known {
            allow all;
            root  /data/letsencrypt/;
        }
    }

    server {
        listen      443           ssl http2;
        listen [::]:443           ssl http2;
        server_name               app.example.com;

        add_header                Strict-Transport-Security "max-age=31536000" always;

        ssl_certificate           /etc/letsencrypt/live/app.example.com/fullchain.pem;
        ssl_certificate_key       /etc/letsencrypt/live/app.example.com/privkey.pem;
        ssl_trusted_certificate   /etc/letsencrypt/live/app.example.com/chain.pem;
    }

}
```

## Configure Docker Compose

```
mkdir -p /opt/contentjet
```

```
version: '3.4'
services:
  nginx:
    image: nginx:1.12.2
    ports:
      - 80:80
      - 443:443
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
      BACKEND_URL: https://api.example.com
      MEDIA_URL: https://media.example.com
      FRONTEND_URL: https://app.example.com
    volumes:
      - media:/opt/contentjet-api/media/
    ports:
      - "80:3000"
volumes:
  media:
```
