const { getUrls, deleteUrls } = require('./api');

const SECRET_AUTH_TOKEN = process.env.SECRET_AUTH_TOKEN;
const VALID_HEADER_TOKEN = `Bearer ${SECRET_AUTH_TOKEN}`;

const embed_rocks_proxy = async (req, res) => {
  // ... dont allow any other method
  if (req.method !== 'POST') {
    return res
      .status(400)
      .send({ error: 'Only POST requests are accepted by this endpoint' });
  }

  const action = req.query && req.query.action;

  // ... ensure action is set in query param
  if (action === undefined) {
    return res
      .status(400)
      .send({ error: '`action` must be provided as a query parameter' });
  }

  // ... ensure only get and delete are allowed
  if (action !== 'get' && action !== 'delete') {
    return res.status(400).send({
      error: 'Only `get` and `delete` actions are supported by this endpoint'
    });
  }

  // ... ensure the request has the appropriate auth header
  if (!req.headers.authorization) {
    return res.status(403).send({
      error:
        '`Authorization` header must be set to the secret auth token for this endpoint'
    });
  }

  if (req.headers.authorization !== VALID_HEADER_TOKEN) {
    return res.status(403).send({
      error: 'You have provided an invalid token'
    });
  }
  const { urls, no_cache = false } = req.body;

  // ... execute the actions and return the resdponse
  if (action === 'get') {
    return getUrls({ urls, no_cache })
      .then(response => res.status(200).send(response))
      .catch(err => {
        console.error(err);
        return res.status(500).send({ error: err });
      });
  } else if (action === 'delete') {
    return deleteUrls({ urls })
      .then(() => res.status(200).send({ success: true }))
      .catch(err => {
        console.error(err);
        return res.status(500).send({ error: err });
      });
  }
};

module.exports = {
  embed_rocks_proxy
};
