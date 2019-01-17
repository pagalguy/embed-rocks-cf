const admin = require('firebase-admin');
const crypto = require('crypto');
const GCP_PROJECT = process.env.GCP_PROJECT;

const ONE_HOUR_SECS = 3600;
const ONE_DAY_SECS = 24 * ONE_HOUR_SECS;

admin.initializeApp({
  databaseURL: `https://${GCP_PROJECT}.firebaseio.com`
});

const rtdb = admin.database();

const get = async urls => {
  // ... convert URLs to cache keys
  const cacheKeys = urls.map(url => makeCacheKey(url));

  console.debug(`Getting keys ${cacheKeys.join(', ')}`);

  // ... collect all promises that fetch from cache
  const promises = cacheKeys.map(key =>
    rtdb.ref(`/embed_rocks_cache/${key}`).once('value')
  );

  return Promise.all(promises).then(responses => {
    // ... make separate list of cached and uncached urls
    const notCachedUrls = [];

    const cachedEmbeds = responses.reduce((map, data) => {
      const embed = data.val();

      // ... return the value, only if the caches has not expired
      if (!hasCacheExpired(embed)) {
        map[embed.url] = embed;
      }

      return map;
    }, {});

    urls.forEach(url => {
      if (cachedEmbeds[url] === undefined) {
        notCachedUrls.push(url);
      }
    });

    console.debug(`URLs - ${notCachedUrls.join(', ')} are not cached`);

    // ... return object of embeds and list of not cached urls
    return { cachedEmbeds, notCachedUrls };
  });
};

const save = async embedsMap => {
  const embedsList = Object.values(embedsMap);

  // ... save all embeds to db, ignore embeds with errors
  const promises = embedsList.map(embed => {
    // ... cached timestamp and cache key
    embed.cache_key = makeCacheKey(embed.url);
    embed.cached_at = new Date().toISOString();

    return rtdb.ref(`/embed_rocks_cache/${embed.cache_key}`).set(embed);
  });

  return Promise.all(promises).then(() =>
    embedsList.reduce((map, embed) => {
      map[embed.url] = embed;
      return map;
    }, {})
  );
};

const remove = async urls => {
  // ... convert URLs to cache keys
  const cacheKeys = urls.map(makeCacheKey);

  // ... collect all promises that fetch from cache
  const promises = cacheKeys.map(key =>
    rtdb.ref(`/embed_rocks_cache/${key}`).delete()
  );

  return Promise.all(promises);
};

const makeCacheKey = url => {
  return crypto
    .createHash('md5')
    .update(url.toString())
    .digest('hex');
};

const hasCacheExpired = embed => {
  if (!embed || !embed.cached_at) {
    return true;
  }

  const diff = Math.abs(
    (new Date().getTime() - new Date(embed.cached_at).getTime()) / 1000
  );

  if (embed.type === 'error' && diff > ONE_HOUR_SECS) {
    return true;
  } else if (diff > ONE_DAY_SECS) {
    return true;
  }

  return false;
};

module.exports = {
  get,
  save,
  remove
};
