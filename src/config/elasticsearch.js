const elasticsearch = require('elasticsearch');
const debug = require('debug');

const log = debug('http:elasticsearch');
const index = ['users', 'categories', 'competitions', 'hashtags', 'posts'];
const type = 'novel';
const port = 9200;
const host = process.env.ES_HOST || 'localhost';
const client = new elasticsearch.Client({ host: { host, port } });

const elastic = {};

const schema = {
  users: {
    userId: { type: 'text' },
    username: { type: 'text' },
    fullname: { type: 'text' },
    avatar: { type: 'text' },
  },

  competitions: {
    competitionId: { type: 'text' },
    title: { type: 'text' },
    banner: { type: 'text' },
  },

  categories: {
    categoryId: { type: 'text' },
    name: { type: 'text' },
  },

  hashtags: {
    hashtagId: { type: 'text' },
    name: { type: 'text' },
  },

  posts: {
    postId: { type: 'text' },
    title: { type: 'text' },
    thumbnail_url: { type: 'text' },
  },
};

elastic.elscheckConnection = async () => {
  let isConnected = false;
  const result = [];
  while (!isConnected) {
    log('Connecting to ES');
    try {
      result.push(client.cluster.health({}));
      isConnected = true;
    } catch (err) {
      log('Connection Failed, Retrying...', err);
    }
  }
  const health = await Promise.all(result);
  log(health);
};

elastic.resetIndex = async () => {
  index.forEach(async (element) => {
    if (await client.indices.exists({ index: element })) {
      await client.indices.delete({ index: element });
    }
    await client.indices.create({ index: element });
    await elastic.mapping(element);
  });
};

elastic.mapping = async (element) => {
  client.indices.putMapping(
    { index: element, body: { properties: schema[element] } },
    (err, resp, status) => {
      if (err) {
        log(err, status);
      } else {
        log('Successfully Created Index', status, resp);
      }
    },
  );
};

elastic.addDocument = async (body, indexName) => {
  const response = await client.index({
    index: indexName,
    body,
  });
  return response;
};

elastic.deleteById = async (id, indexName) => {
  const response = await client.delete({
    index: indexName,
    id,
  });
  return response;
};

elastic.queryTerm = (term, offset = 0) => {
  // const body = {
  //   from: offset,
  //   query: {
  //     match: {
  //       fullname: {
  //         query: term,
  //         operator: 'and',
  //         fuzziness: 'auto',
  //       },
  //     },
  //   },
  //   highlight: { fields: { text: {} } },
  // };

  const body = {
    from: offset,
    query: {
      multi_match: {
        query: term,
        fields: ['username', 'fullname'],
        operator: 'and',
        fuzziness: 'auto',
      },
    },
  };

  return client.search({ index: 'users', body });
};

module.exports = elastic;
