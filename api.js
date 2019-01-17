const cache = require('./cache');
const embeds = require('./embeds');

const getUrls = async ({ urls, no_cache = false }) => {
  console.debug(`Fetching embeds for ${urls.join(', ')}`);
  console.debug(`No Cache is ${no_cache}`);
  if (no_cache) {
    return embeds.get(urls).then(fetched => {
      return fetched;
    });
  } else {
    return cache.get(urls).then(({ cachedEmbeds, notCachedUrls }) => {
      console.debug(
        `Fetching ${notCachedUrls.join(', ')} URLs from embeds.rocks`
      );
      return embeds
        .get(notCachedUrls)
        .then(fetchedEmbeds => cache.save(fetchedEmbeds))
        .then(savedEmbeds => Object.assign({}, cachedEmbeds, savedEmbeds));
    });
  }
};
const deleteUrls = async ({ urls }) => {};

module.exports = {
  getUrls,
  deleteUrls
};
