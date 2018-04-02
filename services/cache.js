const mongoose = require('mongoose');
const redis = require('redis');
// node standard package
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
// promisify redis get
client.hget = util.promisify(client.hget);

// get the mongoose exec function
const exec = mongoose.Query.prototype.exec;

// add custom cache function
mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    //custom var
    this.hashKey = JSON.stringify(options.key || '');
    return this;
};

mongoose.Query.prototype.exec = async function() {
    if (!this.useCache) {
        // console.log('NOT using cache');

        // run original exec function
        return exec.apply(this, arguments);
    }

    // console.log('using cache');
    const key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name,
        }),
    );

    // check if we have a key in redis
    const cacheValue = await client.hget(this.hashKey, key);

    // if we do, return it
    if (cacheValue) {
        // turn our redis result into parsed document
        const doc = JSON.parse(cacheValue);

        // check if our doc is an array of elements
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);

    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

    return result;
};

module.exports = {
    clearHash(hasKey) {
        client.del(JSON.stringify(hasKey));
    },
};
