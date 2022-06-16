'use strict'
const _ = require('lodash')
const { DateTime } = require('luxon')
const { Client } = require('@elastic/elasticsearch')

const es = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID,
  },
  auth: {
    username: 'elastic',
    password: process.env.pwd
  }
})

exports.insert = async (index, object) => {
  object.createdAt = DateTime.utc().toISO()
  const inserted = await es.index({ index, body: object, refresh: true })
  return _.assign(object, extractId(inserted))
}

exports.override = async (index, id, body) => {
  return await update(index, id, body)
}

exports.update = async (index, id, doc) => {
  return await update(index, id, { doc })
}

exports.upsert = async (index, id, doc) => {
  doc.createdAt = DateTime.utc().toISO()
  return await update(index, id, { doc, doc_as_upsert: true })
}

exports.updateByScript = async (index, id, script) => {
  return await update(index, id, { script })
}

exports.updateByQuery = async (index, script, query) => {
  const result = await es.updateByQuery({ index, refresh: true, body: { script, query } })
  return extractId(result)
}

exports.all = async (index, pagination = {}, sort = [], pretty = true) => {
  return await search(index, {}, pagination, sort, pretty)
}

exports.query = async (index, match = {}, pagination = {}, sort = [], pretty = true) => {
  return await search(index, match, pagination, sort, pretty)
}

exports.get = async (index, id) => { 
  const body = await es.get({ index, id })
  return getSourceWithId(body)
}

exports.remove = async(index, key) => {
  const { id, result } = await es.delete({ index, id: key })
  return { id, result }
}

exports.removeByQuery = async(index, query) => {
  const params = { index, body: { query }}
  const { total, deleted } = await es.deleteByQuery(params)
  return { total, deleted }
}
/**
 * Monta uma query expression para buscar por todos os campos informados
 * @param {Array} fields A lista de campos do documento que poderá ser filtrada
 * @param {Object} queryParameters O objeto com os atributos de mesmo nome dos campos
 * informados na lista
 * @returns Um objeto query expression para filtro no elasticsearch
 */
exports.mustMatchAllFields = (fields, queryParameters) => {
  function mapFields(field) {
    const fieldName = _.isString(field) ? field : _.get(field, 'name')
    const fieldValue = _.isString(field) ? field : _.get(field, 'value')
    const value = _.get(queryParameters, fieldName, undefined)
    if (_.isEmpty(value))
      return undefined

    const useLike = _.isString(field) ? false : _.get(field, 'useLike', false)
    const expr = _.assign({}, { [ fieldValue ]: useLike ? `*${decodeURI(value)}*` : decodeURI(value) })
    return useLike ? { wildcard: expr } : { match: expr }
  }

  const must = _.compact(_.map(fields, mapFields))
  return { query: { bool: { must } } }
}

exports.client = es

async function update(index, id, body) {
  const result = await es.update({ index, id, body, refresh: true })
  return extractId(result)
}

async function search(index, body, pagination, sort, pretty) {
  const { limit = 10, offset = 0 } = pagination
  const params = {
      index,
      size: limit,
      from: offset,
      body
  }
  params.body.sort  = _.isEmpty(sort) ? undefined : sort
  const result = await es.search(params)
  return pretty ? mapResult(result) : result
}

function mapResult(body) {
  const { total, hits } = _.pick(body.hits, [ 'total.value', 'hits' ])
  const items = _.map(hits, getSourceWithId)
  return { items, total: total.value, aggs: body.aggregations }
}

function getSourceWithId(object) {
  return _(object).pick([ '_id', '_source' ])
                .set('_source.id', object._id)
                .omit('_id')
                .get('_source')
}

function extractId(body) {
  const { _id } = _.pick(body, '_id')
  return { id: _id }
}