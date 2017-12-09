---
title: Installing contentjet on Ubuntu 16.04
layout: guide.ejs
---
# Installing contentjet on Ubuntu 16.04

TODO: Introductory copy. Goals of this guide etc.

## 0. Create system user

Begin by creating a new system user. You will be prompted to enter a password.

```
adduser contentjet
```

Add our new user to the sudo user group.

```
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

We must make a slight change to the default PostgreSQL configuration so contentjet-api can connect to it.

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

Save the changes to this file and reload PostgreSQL.

```
systemctl reload postgresql
```

#### Create database

Switch to the postgres user.

```
su postgres
```

Create a new database user. You will be prompted to set a password. _Be sure to make note of this username and password as you will need it in a future step._

```
createuser -W contentjet
```

Create a new database database named `contentjet-api` specifiying the user created in the previous step as the owner.

```
createdb -O contentjet contentjet-api
```

Press `Control + d` to exit from the `postgres` user's shell and return to the `root` user's shell.

## Install & configure contentjet-api

#### Clone repository

Create a new directory and make our `contentjet` user the owner.

```
mkdir -p /var/www/contentjet
chown contentjet:contentjet /var/www/contentjet
```

Switch to our `contentjet` user.

```
su contentjet
```

Clone the `contentjet-api` repository.

```
cd /var/www/contentjet
git clone https://github.com/contentjet/contentjet-api.git
cd contentjet-api
```

#### Install application dependencies

```
npm install --production
```

#### Edit config

In this step we will edit our configuration file to add our database and mail settings.

`nano config/config.production.js`

Under the `DATABASE` key you must set the `user` and `password` values to those you created in the **Create database** step above.

**TODO Add mail config instructions**

#### Migrate database

To create the required tables in our database run the `migrate` command.

```
NODE_ENV=production npm run migrate
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

#### Clone repository

```
/var/www/contentjet
git clone https://github.com/contentjet/contentjet-ui.git
```

## Configure NGINX

TODO
