const axios = require('axios')
const https = require('https')
const { token } = require('../.env');


const api = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    baseURL: 'https://tommy.git/api/v4/',
    headers: {
        'PRIVATE-TOKEN': token
    },
    timeout: 6000,
})

const botApi = axios.create({
    baseURL: 'http://localhost:1453/',
    timeout: 5000
})

module.exports = { api, botApi };