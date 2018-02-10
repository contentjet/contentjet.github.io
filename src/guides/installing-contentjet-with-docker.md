---
title: Installing contentjet with Docker
layout: guide.ejs
---

# Installing contentjet with Docker

In this guide we will install contentjet onto a single host running Ubuntu 16.04 with Docker. By the end of this guide you will have a complete installation of contentjet cms secured with free TLS certificates provided by Let's Encrypt.

To complete this installation you must possess the following knowledge:

* Navigating a linux command line, specifically the BASH shell
* Connecting to a remote server over SSH
* Configuration of DNS
* Basic understanding of Docker

You must also have:

* A server running a fresh install of Ubuntu 16.04 which you can SSH into ([DigitalOcean](https://www.digitalocean.com/) is a good choice)
* A domain name registered through a registrar which gives you full access to the domain's DNS records

## Configure DNS

We will host contentjet with the following 3 subdomains as follows:

  * **app.example.com**
    Will host the contentjet frontend, contentjet-ui

  * **api.example.com**
    Will host the contentjet backend, contentjet-api

  * **media.example.com**
    Will host user uploaded media

You must log into your domain registrar and create 3x A records for **app**, **api** and **media** all pointing to the IP address of your server.

## Install Docker & Docker Compose

Connect to your server over SSH and install Docker and Docker Compose. Refer to the following guides provided by DigitalOcean.

[How To Install and Use Docker on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)

[Install Docker Compose](https://docs.docker.com/compose/install/#install-compose)

## Generate certificates with Let's Encrypt

In this step we will generate the free certificates for your 3 subdomains.

Run the following command to start a temporary server on port 80. This will create 2 named volumes which are used for storing the certificates generated in the next step as well as the challenge files required as part of Let's Encrypt's validation step.

```
docker run \
  --name temp-server \
  --rm \
  -d \
  -v certs:/etc/letsencrypt \
  -v certs-data:/data/letsencrypt \
  -w /data/letsencrypt \
  -p 80:8000 \
  python:alpine3.7 \
  python -m http.server 8000
```

Next, run the following command to request certificates from Let's Encrypt. **Make sure you change the last 4 lines of this command to reflect your own email address and domain**.

```
docker run \
  -it \
  --rm \
  -v certs:/etc/letsencrypt \
  -v certs-data:/data/letsencrypt \
  certbot/certbot \
  certonly \
  --preferred-challenges http \
  --agree-tos \
  --webroot \
  --webroot-path=/data/letsencrypt \
  --non-interactive \
  -m youremail@example.com \
  -d app.example.com \
  -d api.example.com \
  -d media.example.com
```

Assuming the above command executes successfully the certificates will have been written to our named volume. **You MUST now stop the temporary server**.

```
docker stop temp-server
```

## Configure NGINX

Next we will configure NGINX. Copy the following text and save it to **/opt/contentjet/nginx.conf** on your server.

```
user              nginx;
worker_processes  1;

pid               /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include                   /etc/nginx/mime.types;
    default_type              application/octet-stream;

    ssl_session_cache         shared:SSL:20m;
    ssl_session_timeout       10m;

    ssl_protocols             TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_ciphers               "ECDH+AESGCM:ECDH+AES256:ECDH+AES128:!ADH:!AECDH:!MD5;";

    ssl_stapling              on;
    ssl_stapling_verify       on;

    ssl_certificate           /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key       /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_trusted_certificate   /etc/letsencrypt/live/example.com/chain.pem;

    add_header                Strict-Transport-Security "max-age=31536000" always;

    resolver                  8.8.8.8 8.8.4.4;

    access_log                /dev/stdout;
    error_log                 /dev/stderr info;

    server {
        listen 80 default_server;
        server_name *.example.com;

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

        location / {
            proxy_pass                http://ui:9000;
            proxy_http_version        1.1;
            proxy_set_header          Host $host;
        }
    }

    server {
        listen      443           ssl http2;
        listen [::]:443           ssl http2;
        server_name               api.example.com;

        client_max_body_size      200M;

        location / {
            proxy_pass                http://api:3000;
            proxy_http_version        1.1;
            proxy_set_header          Upgrade $http_upgrade;
            proxy_set_header          Connection 'upgrade';
            proxy_set_header          Host $host;
            proxy_cache_bypass        $http_upgrade;
        }
    }

    server {
        listen      443           ssl http2;
        listen [::]:443           ssl http2;
        server_name               media.example.com;

        root                      /opt/contentjet-api/media/;
    }

}
```

Now we just need to change every occurance of **example.com** to _your_ actual domain. We can do this easily using `sed`. For example if your domain name was **acme.com** you would run the following command from within the **/opt/contentjet/** directory.

```
sed -i -e 's/example.com/acme.com/g' nginx.conf
```

## Configure Docker Compose

Next copy the following and save it to **/opt/contentjet/docker-compose.yml**.

```
version: '3.4'
services:
  nginx:
    image: nginx:1.12.2
    ports:
      - 80:80
      - 443:443
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - certs:/etc/letsencrypt
      - certs-data:/data/letsencrypt
      - media:/opt/contentjet-api/media/
  db:
    image: postgres:9.6.2
    restart: always
    environment:
      POSTGRES_USER: yourdbuser
      POSTGRES_PASSWORD: yourdbpassword
      POSTGRES_DB: contentjet-api
  api:
    image: contentjet/contentjet-api
    restart: always
    environment:
      POSTGRES_HOST: db
      POSTGRES_USER: yourdbuser
      POSTGRES_PASSWORD: yourdbpassword
      POSTGRES_DB: contentjet-api
      SECRET_KEY: yoursupersecretkey
      NODE_ENV: production
      MAIL_BACKEND: mailgun
      MAILGUN_API_KEY: yourapikey
      MAILGUN_DOMAIN: yourdomain
      MAIL_FROM: noreply@example.com
      BACKEND_URL: https://api.example.com
      MEDIA_URL: https://media.example.com
      FRONTEND_URL: https://app.example.com
    volumes:
      - media:/opt/contentjet-api/media/
  ui:
    image: contentjet/contentjet-ui
    restart: always
    environment:
      BACKEND_URL: https://api.example.com
      PORT: 9000
volumes:
  media:
  certs:
    external: true
  certs-data:
    external: true
```

Similar to the change we made to **nginx.conf** we need to replace all occurances of **example.com** with _your_ domain name. Again, this can be done quickly using `sed` by running the following from within the **/opt/contentjet** directory.

```
sed -i -e 's/example.com/acme.com/g' docker-compose.yml
```

We need to make some additional edits to the environment variables within this file.

TODO

```
docker-compose up -d
```

## Create an administrator

At this point contentjet should be running on your domain however there are no users! Create your first user by running the following command and entering your email address and your desired password at the prompt.

```
docker-compose exec api npm run create-admin-user
```
