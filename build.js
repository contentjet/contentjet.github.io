const Metalsmith = require('metalsmith');
const collections = require('metalsmith-collections');
const layouts = require('metalsmith-layouts');
const markdown = require('metalsmith-markdown');
const permalinks = require('metalsmith-permalinks');
const dataLoader = require('metalsmith-data-loader');
const postcss = require('metalsmith-postcss');
const serve = require('metalsmith-serve');
const debug = require('metalsmith-debug');
const slugify = require("underscore.string/slugify");


let metalsmith = Metalsmith(__dirname)
  .metadata({
    slugify
  })
  .source('./src')
  .destination('./dist')
  .clean(true)
  .use(
    postcss({
      plugins: {
        'postcss-import': {},
        'postcss-nested': {},
        'postcss-cssnext': {},
        'lost': {}
      }
    })
  )
  .use(
    collections({
      docs: {
        pattern: [
          'documentation/*.md'
        ],
        sortBy: 'order'
      }
    })
  )
  .use(
    dataLoader({
      removeSource: true
    })
  )
  .use(markdown())
  .use(permalinks())
  .use(
    layouts({
      engine: 'ejs'
    })
  )
  .use(debug());

if (process.env.npm_lifecycle_event === 'start') metalsmith = metalsmith.use(serve());

metalsmith.build(function (err) {
  if (err) throw err;
});
