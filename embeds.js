const http = require('superagent');

const API_KEY = process.env.API_KEY;
const API_PATH = 'https://api.embed.rocks/api/';

const get = async urls => {
  const fetchedEmbeds = {};

  const promises = urls.map(url => {
    const reqUrl = `${API_PATH}?key=${API_KEY}&url=${url}&skip=article`;
    console.log(`Making API call to ${reqUrl}`);
    return (
      http
        .get(reqUrl)
        .set('Accept', 'application/json')
        // ... do this for each request so that the original url is set
        // so that if the original url has a redirect, the hashmap still has
        // the key of the url requested
        .then(res => {
          const embed = res.body;
          embed.requested_url = url;
          fetchedEmbeds[embed.requested_url] = embed;
        })
    );
  });

  return Promise.all(promises).then(() => fetchedEmbeds);
};

module.exports = {
  get
};
