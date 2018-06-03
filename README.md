# contentjet

![license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)

Contentjet is a powerful headless API-first CMS composed of 2 discreet applications, the backend API [contentjet-api](https://github.com/contentjet/contentjet-api) and the frontend HTML user interface [contentjet-ui](https://github.com/contentjet/contentjet-ui).

See https://contentjet.github.io/ to learn more.

## Development
Development is done from the `develop` branch. Built files are copied to the `master` branch to make live with github pages.

**IMPORTANT:** When cloning this project you MUST remove any periods in the path on your system otherwise nodemon will fail to detect changes e.g `mv contentjet.github.io contentjet-github-io`.

### Requirements
* Node 8+
* NPM 5+

### Quickstart
1. Check out the develop branch `git checkout develop`
2. Install dependencies with `npm install`
3. Run development server `npm start`

