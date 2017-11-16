const Metalsmith = require('metalsmith');
const collections = require('metalsmith-collections');
const layouts = require('metalsmith-layouts');
const markdown = require('metalsmith-markdown');
const permalinks = require('metalsmith-permalinks');
const dataLoader = require('metalsmith-data-loader');
const postcss = require('metalsmith-postcss');
const serve = require('metalsmith-serve');
const debug = require('metalsmith-debug');


Metalsmith(__dirname)
  .source('./src')
  .destination('./build')
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
      guides: 'guides/*.md',
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
  .use(debug())
  .use(
    serve()
  )
  .build(function (err) {
    if (err) throw err;
  });
