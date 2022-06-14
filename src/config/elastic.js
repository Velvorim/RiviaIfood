const { Client } = require('@elastic/elasticsearch');

const elasticClient = new Client({
    node: process.env.id,
    auth: {
      username: process.env.user,
      password: process.env.pass
    }
});

module.exports = elasticClient;