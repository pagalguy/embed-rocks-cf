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
        .then(savedEmbeds => {
          const responseEmbeds = Object.assign({}, cachedEmbeds, savedEmbeds);
          console.debug(
            `Requested ${urls.length} URLs. Returning ${
              Object.keys(responseEmbeds).length
            } embeds.`
          );
          return responseEmbeds;
        });
    });
  }
};
const deleteUrls = async ({ urls }) => {
  return cache.remove(urls);
};

module.exports = {
  getUrls,
  deleteUrls
};
