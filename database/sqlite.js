const DataBase = require('sqlite-async')

module.exports = {
    async createOrOpenDB () {
        const db = await DataBase.open('repo-info');
        return db;
    }
}