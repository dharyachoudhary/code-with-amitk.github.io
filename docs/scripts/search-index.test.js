const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.Node = dom.window.Node;
global.Element = dom.window.Element;

const { getPageHeadings } = require('./build-search-index');
const { buildResultItem } = require('./search.js');

const html = `
<html>
  <body>
    <main>
      <h1>Machine Learning Terms</h1>
      <h2>Gradient Descent</h2>
      <h3>Learning Rate</h3>
      <p>Example text.</p>
    </main>
  </body>
</html>`;

const headings = getPageHeadings(html);
assert.deepStrictEqual(headings, [
  'Machine Learning Terms',
  'Gradient Descent',
  'Learning Rate',
]);

const resultItem = buildResultItem({
  title: 'Machine Learning Terms',
  url: '/Machine_Learning/Terms.html',
  matchedHeading: 'Learning Rate',
});
assert.strictEqual(resultItem.querySelectorAll('.search-result-heading').length, 0);

console.log('search-index heading extraction test passed');
