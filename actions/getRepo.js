const { api } = require('../utils/api');
const { per_page } = require('../utils/global.params')

module.exports = {
    async getRepoList() {
        const res = await api.get('/projects', { params: { per_page } });
        if (res.status !== 200) throw res.statusText
        return res.data.map(item => {
            return {
                id: item.id,
                name: item.name
            };
        })
    }
}