---
title: Installing contentjet on Ubuntu 16.04
layout: guide.ejs
---
# Installing contentjet on Ubuntu 16.04

TODO: Introductory copy. Goals of this guide etc.

## 0. Create system user

```
adduser contentjet
usermod -aG sudo contentjet
```

## 1. Install dependencies

#### Add apt repository for Node 8

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash
```

#### Update package lists

```
sudo apt-get update -y
```

#### Install required dependencies

```
sudo apt-get install nginx postgresql postgresql-contrib build-essential nodejs -y
```

## 2. Configure PostgreSQL

#### Edit postgres configuration

```
nano /etc/postgresql/9.5/main/pg_hba.conf
```

Change from:

```
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
```

To:

```
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
```

#### Save changes and reload postgresql

```
systemctl reload postgresql
```

#### Create database

```
su postgres
createuser -W contentjet
createdb -O contentjet contentjet-api
```

## Install & configure contentjet-api

#### Clone repository

```
sudo mkdir -p /var/www/contentjet
git clone https://github.com/contentjet/contentjet-api.git
npm install --production
```

#### Migrate database

```
npm run migrate
```

#### Create admin user

```
npm run create-admin-user
```

```
pm2 startup ubuntu -u contentjet --hp /home/contentjet
```

```
NODE_ENV=production pm2 start /var/www/contentjet/contentjet-api/server.js -i max
```

## Install & configure contentjet-ui

TODO

## Configure NGINX

TODO
