---
title: Install with Docker
layout: doc.ejs
order: 5
---

# Installing contentjet with Docker

In this guide we will install contentjet onto a single host running Ubuntu 16.04 with Docker. By the end of this guide you will have a complete installation of contentjet secured with free TLS certificates provided by [Let's Encrypt](https://letsencrypt.org/).

To complete this installation you must possess the following knowledge:

* Navigating a linux command line, specifically the BASH shell
* Connecting to a remote server over SSH
* Configuration of DNS
* An understanding of Docker

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

Connect to your server over SSH and install Docker.

```bash
curl -fsSL get.docker.com -o get-docker.sh
sh get-docker.sh
```

Refer to the official documentation on [installing Docker Compose](https://docs.docker.com/compose/install/#install-compose).

## Generate certificates with Let's Encrypt

In this step we will generate the free certificates for your 3 subdomains.

Run the following command to start a temporary server on port 80. This will create 2 named volumes which are used for storing the certificates generated in the next step as well as the challenge files required as part of Let's Encrypt's validation step.

```bash
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

```bash
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

```bash
docker stop temp-server
```

Now create a cron job which runs every 5 days to automatically renew your certificates. Edit your cron with `crontab -e` and add the following:

```bash
0 0 */5 * *  docker run --rm -v certs:/etc/letsencrypt -v certs-data:/data/letsencrypt certbot/certbot renew -n >> /var/log/certbot.log
```

## Configure NGINX

Next we will configure NGINX. Copy the following text and save it to **/opt/contentjet/nginx.conf** on your server.

```nginx
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

        expires                   1M;

        root                      /opt/contentjet-api/media/;
    }

}
```

We now need to change every occurance of **example.com** to your actual domain. We can do this easily using `sed`. For example if your domain name was **acme.com** you would run the following command from within the **/opt/contentjet/** directory.

```bash
sed -i -e 's/example.com/acme.com/g' nginx.conf
```

## Configure Docker Compose

Next copy the following and save it to **/opt/contentjet/docker-compose.yml**.

```yaml
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
      POSTGRES_USER: yourdbuser # CHANGE ME
      POSTGRES_PASSWORD: yourdbpassword # CHANGE ME
      POSTGRES_DB: contentjet-api
  api:
    image: contentjet/contentjet-api
    restart: always
    environment:
      NODE_ENV: production
      POSTGRES_HOST: db
      POSTGRES_USER: yourdbuser # CHANGE ME
      POSTGRES_PASSWORD: yourdbpassword # CHANGE ME
      POSTGRES_DB: contentjet-api
      SECRET_KEY: yoursupersecretkey # CHANGE ME
      SMTP_HOST: smtphost # CHANGE ME
      SMTP_PORT: smtpport # CHANGE ME
      SMTP_USER: smtpuser # CHANGE ME
      SMTP_PASSWORD: smtppassword # CHANGE ME
      MAIL_FROM: noreply@example.com # CHANGE ME
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

```bash
sed -i -e 's/example.com/acme.com/g' docker-compose.yml
```

We need to make some additional edits to the environment variables within this file. As you can see there are 4 services defined _**nginx**_, _**db**_, _**api**_ and _**ui**_. You MUST provide values for the lines commented with **`#CHANGE ME`**.

`SECRET_KEY` simply needs to be a unique random string of your choosing. Make sure you keep it secret as it's used in encrypting passwords and tokens.

## Run services

```bash
docker-compose up -d
```

Docker will now automatically pull the necessary images and start all services. To confirm everything is running navigate to `https://app.yourdomain.com`.

## Create an administrator

At this point contentjet should be running on your domain however there are no users! Create your first user by running the following command and entering your email address and your desired password at the prompt.

```bash
docker-compose exec api npm run create-admin-user
```
