const http = require('superagent');

const API_KEY = process.env.API_KEY;
const API_PATH = 'https://api.embed.rocks/api/';

const get = async urls => {
  const requests = urls.map(url => {
    const reqUrl = `${API_PATH}?key=${API_KEY}&url=${url}&skip=article`;
    console.log(`Making API call to ${reqUrl}`);
    return http.get(reqUrl).set('Accept', 'application/json');
  });

  return Promise.all(requests).then(responses => {
    const fetchedEmbeds = {};

    responses.forEach(res => {
      fetchedEmbeds[res.body.url] = res.body;
    });

    return fetchedEmbeds;
  });
};

module.exports = {
  get
};
