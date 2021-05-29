//@ts-check
const { api } = require('../utils/api');

module.exports = {
    /**
     * 
     * @param {number} repoId 
     * @param {string} createTime
     * @param {string} repoName
     * @param {import('sqlite-async')} db
     */

    async getMergeRequest(repoId, repoName, db) {
        const res = await api.get(`/projects/${repoId}/merge_requests?state=opened`)
        if (res.status !== 200) {
            throw res.statusText
        }
        const data = res.data
        if (data.length === 0) return undefined
        const prev = await db.get('SELECT * FROM REPOS WHERE NAME = $name AND ID = $repoId', { $name: repoName, $repoId: repoId })
        if (prev === undefined) {
            const cur = await db.run('INSERT INTO REPOS (NAME, ID, LATEST_MR) VALUES ($name, $id, $mr)',
                {
                    $name: repoName,
                    $id: repoId,
                    $mr: data[0].web_url,
                })
            return undefined
        }
        else if (prev.LATEST_MR !== data[0].web_url) {
            const cur = await db.run('UPDATE REPOS SET LATEST_MR = $id WHERE NAME = $name AND ID = $repoId', {
                $id: data[0].web_url, $name: repoName, $repoId: repoId
            })
            if (prev.LATEST_MR === undefined) return undefined
            const curId = data.findIndex((item) => {
                return item.web_url.startsWith(prev.LATEST_MR)
            })
            return data.slice(0, curId === -1 ? 1 : curId).map((item) =>
                `🚀 New Merge Request in repo ${repoName}
                \n${item.title}
                \nby: ${item.author.name}
                \n\n${item.description}
                \n\n${item.web_url}`
            ).reverse()
        }
        return undefined
    },

    /**
     * 
     * @param {number} repoId 
     * @param {string} createTime
     * @param {string} repoName
     * @param {import('sqlite-async')} db
     */

    async getIssues(repoId, repoName, db) {
        const res = await api.get(`/projects/${repoId}/issues?state=opened`)
        if (res.status !== 200) {
            throw res.statusText
        }
        const data = res.data
        if (data.length === 0) return undefined

        const prev = await db.get('SELECT * FROM REPOS WHERE NAME = $name AND ID = $repoId', { $name: repoName, $repoId: repoId })
        if (prev === undefined) {
            const cur = await db.run('INSERT INTO REPOS (NAME, ID, LATEST_ISSUE) VALUES ($name, $id, $issue)',
                {
                    $name: repoName,
                    $id: repoId,
                    $issue: data[0].web_url,
                })
            return undefined
        }
        else if (prev.LATEST_ISSUE !== data[0].web_url) {
            const cur = await db.run('UPDATE REPOS SET LATEST_ISSUE = $id WHERE NAME = $name AND ID = $repoId', {
                $id: data[0].web_url, $name: repoName, $repoId: repoId
            })
            if (prev.LATEST_ISSUE === undefined) return undefined
            const curId = data.findIndex((item) => {
                return (item.web_url.startsWith(prev.LATEST_ISSUE))
            })
            return data.slice(0, curId === -1 ? 1 : curId).map((item) =>
                `💬 New Issue in repo ${repoName}
                \n${item.title}
                \nby: ${item.author.name}
                \n\n${item.description}
                \n\n${item.web_url}`
            ).reverse()
        }
        return undefined
    },

    /**
     * 
     * @param {number} repoId 
     * @param {string} createTime
     * @param {string} repoName
     * @param {import('sqlite-async')} db
     */

    async getCommits(repoId, repoName, db) {
        const res = await api.get(`/projects/${repoId}/repository/commits`)
        if (res.status !== 200) {
            throw res.statusText
        }
        const data = res.data
        if (data.length === 0) return undefined
        const prev = await db.get('SELECT * FROM REPOS WHERE NAME = $name AND ID = $id', { $name: repoName, $id: repoId })
        if (prev === undefined) {
            const cur = await db.run('INSERT INTO REPOS (NAME, ID, LATEST_COMMIT) VALUES ($name, $id, $commit)',
                {
                    $name: repoName,
                    $id: repoId,
                    $commit: data[0].id,
                })
            return undefined
        }
        else if (prev.LATEST_COMMIT !== data[0].id) {
            const curId = data.findIndex((item) => {
                return (item.id.startsWith(prev.LATEST_COMMIT) || prev.LATEST_COMMIT.startsWith(item.id))
            })
            const cur = await db.run('UPDATE REPOS SET LATEST_COMMIT = $id WHERE NAME = $name AND ID = $repoId',
                {
                    $id: data[0].id,
                    $name: repoName,
                    $repoId: repoId
                })
            return data.slice(0, curId).map((item) =>
                `🔨 New commit in repo ${repoName}!
                \n${item.message}
                \nby: ${data[0].committer_name}
                \n${item.web_url}`
            ).reverse()
        }
        return undefined
    }
}