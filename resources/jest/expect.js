/**
 * Check whether provided mocked function has thrown at least once.
 * @param {*} mockFn
 *
 * @see [`mockFn.mock.results`](https://jestjs.io/docs/en/mock-function-api#mockfnmockresults) for implementation details.
 * @todo Implement custom `global.expect` matcher.
 */
function hasThrown(mockFn) {
  return !!mockFn.mock.results.find(r => r.type === 'throw');
}

module.exports = {
  hasThrown,
};
