
This Cloud Function is used as proxy to cache API responses from https://embed.rocks/docs. It uses Firebase Realtime Database (RTDB) to store the cached objects. I chose Firebase RTDB because, it provides an interface to view and edit these cached objects. This interfaces makes it easy to debug and deal with problems in future.

The CF endpoint only supports `POST` method. Different actions are supported by a URL parameter `action`
- `get` for fetching data of one or many URLs
- `delete` for purging cached data of one or many URLs


`GET` is not supported, because we can request data for, say 20 URLs, in a GET call

Additional attributes:
- `cached_at` is the timestamp when the object was cached to RTDB
- `cache_key` is the md5 hash of the URL sent. This CF does not parse, validate URLs

API requests that return error code/response from embed.rocks will not be cached.


## API

To prevent publlic free-for-all access, all requests to this CF must send an authorization token.

`> POST /embed_rocks_proxy?action=get`

`Header -> Authorization: Bearer {your auth token}`

```json
{
  "urls": [
    "https://www.example.com/link1.html",
    "https://www.example.com/link2.html",
    "https://www.example.com/link3.html"
  ],
  "no_cache" : false
}
```

Response

```json
{
  "https://www.example.com/link1.html" : {
    // ... embed.rocks API response
    // ... additionally
    "cached_at": 1547715475000,
    "cache_key": "dded7366c0c3ac23e73e3cda372b5025"
  }
}
```

`> POST /embed_rocks_proxy?action=delete`

`Header -> Authorization: Bearer {your auth token}`

```json
{
  "urls": [
    "https://www.example.com/link1.html",
    "https://www.example.com/link2.html",
    "https://www.example.com/link3.html"
  ]
}
```

Response

```json
{
  "success": true
}
```