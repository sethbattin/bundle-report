const axios = require('axios')
let { repo } = require('ci-env')
const { sha, ci } = require('ci-env')
const { warn } = require('prettycli')
const querystring = require('querystring')

const token = require('./token')
const debug = require('./debug')

const url = 'https://bundlesize-store.now.sh'

const valuesUrl = () => `${url}/values`

let enabled = false

if (repo && token) enabled = true
else if (ci) {
  warn(`github token not found

    You are missing out on some cool features.
    Read more here: https://github.com/siddharthkp/bundlesize#2-build-status
  `)
}

debug('api enabled', enabled)

const get = () => {
  debug('fetching values', '...')

  repo = repo.replace(/\./g, '_')
  return axios
    .get(`${valuesUrl()}?repo=${repo}&token=${token}`)
    .then(response => {
      const values = {}
      if (response && response.data && response.data.length) {
        response.data.map(file => (values[file.path] = file.size))
      }
      debug('master values', values)
      return values
    })
    .catch(error => {
      debug('fetching failed', error.response.data)
      console.log(error)
    })
}

const set = values => {
  if (repo && token) {
    repo = repo.replace(/\./g, '_')
    debug('saving values')

    axios
      .post(valuesUrl(), { repo, token, sha, values })
      .catch(error => console.log(error))
  }
}

const resultsUrl = info => `${url}/build?${querystring.stringify({ info })}`

const api = { enabled, set, get, resultsUrl }
module.exports = api
