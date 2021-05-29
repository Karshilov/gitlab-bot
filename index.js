const { getCommits, getIssues, getMergeRequest } = require('./actions')
const { getRepoList } = require('./actions/getRepo')
const schedule = require('node-schedule')
const { createOrOpenDB } = require('./database/sqlite')
const { botApi } = require('./utils/api')
const { core } = require('./.ignore')
const { groupId, adminId } = require('./.env')

/**
 * 
 * @param {number} id 
 * @param {string} msg 
 */

const sendGroupMessage = async (id, msg) => {
    const res = await botApi.get('/send_group_msg', {
        params: {
            "group_id": id,
            "message": msg
        }
    })
    if (res.status !== 200) throw res.statusText
}

const sendPrivateMessage = async (userId, groupId, msg) => {
    const res = await botApi.get('/send_private_msg', {
        params: {
            "user_id": userId,
            "group_id": groupId,
            "message": msg
        }
    })
    if (res.status !== 200) throw res.statusText
}

const scheduleCronstyle = () => {
    //每分钟的第30秒定时执行一次:
    schedule.scheduleJob('30 * * * * *', async () => {
        const db = await createOrOpenDB();

        try {
            const repos = await getRepoList();
            repos.forEach(async (element) => {
                if (element.name === core) return
                const commits = await getCommits(element.id, element.name, db)
                if (commits) {
                    commits.forEach(async (item) => {
                        await sendGroupMessage(groupId, item.toString());
                    })
                }
                const mrs = await getMergeRequest(element.id, element.name, db)
                if (mrs) {
                    mrs.forEach(async (item) => {
                        await sendGroupMessage(groupId, item.toString());
                    })
                }
                const issues = await getIssues(element.id, element.name, db)
                if (issues) {
                    issues.forEach(async (item) => {
                        await sendGroupMessage(groupId, item.toString());
                    })
                }
            });
        } catch (err) {
            await sendPrivateMessage(adminId, groupId, err);
        }
    });
}

scheduleCronstyle();

