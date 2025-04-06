const axios = require("axios");

// 封装配置读取和请求 URL 生成
function getConfig() {
    const agent = config.UserAgent;
    const iActivityId = config.tps.iActivityId;
    const sSDID = config.tps.sSDID;
    const e_code = config.tps.ecode;
    const eas_url = config.tps.easurl;
    const url = `https://comm.ams.game.qq.com/ams/ame/amesvr?sServiceType=tps&iActivityId=${iActivityId}&sServiceDepartment=group_a&sSDID=${sSDID}`;
    return { agent, iActivityId, sSDID, e_code, eas_url, url };
}

// 生成随机字符串
function generateRandomString(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// 封装任务请求逻辑
async function getTask({ flowId, task, taskId, token, agent, url, e_code, eas_url }) {
    const randomTag = generateRandomString();
    const postData = `sServiceType=tps&iActivityId=${config.tps.iActivityId}&sServiceDepartment=group_a&iFlowId=${flowId}&g_tk=1842395457&sMiloTag=AMS-tps-1219120114-${randomTag}-${config.tps.iActivityId}-${flowId}&e_code=${e_code}&g_code=0&eas_url=${eas_url}&eas_refer=${eas_url}&${task}=${taskId}`;
    try {
        const response = await axios.post(url, postData, {
            headers: {
                'User-Agent': agent,
                Cookie: token,
                'referer': 'https://tps.qq.com/'
            },
        });
        if (response.status === 200) {
            return response.data.ret === "0"
               ? `${task}${taskId}领取成功`
                : `${task}${taskId}领取失败,原因：${response.data.msg}`;
        }
        return `${task}${taskId}领取失败`;
    } catch (error) {
        return `${task}${taskId}领取失败，原因：${error.message}`;
    }
}

// 执行单个用户的任务
async function executeUserTasks(cookie, configData) {
    let msg = '开始领取战令奖励\n';
    const taskTypes = [
        { id: 'taskRicevere', flowId: config.tps.iFlowId, tasks: config.tps.taskRicevere.split("&") },
        { id: 'taskRicevereWeek', flowId: config.tps.iFlowIdWeek, tasks: config.tps.taskRicevereWeek.split("&") },
        { id: 'taskRicevereTz', flowId: config.tps.iFlowIdTz, tasks: config.tps.taskRicevereTz.split("&") }
    ];

    for (const { id, flowId, tasks } of taskTypes) {
        for (const taskId of tasks) {
            const result = await getTask({ ...configData, flowId, task: id, taskId, token: cookie });
            console.log(result);
            msg += result;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    return msg;
}

// 主函数，处理多个用户
async function tps() {
    const cookies = config.tps.cookies;
    const configData = getConfig();
    let allMessages = '';

    for (let i = 0; i < cookies.length; i++) {
        console.log(`开始领取用户 ${i + 1} 的战令奖励`);
        const cookie = cookies[i];
        const userMsg = await executeUserTasks(cookie, configData);
        allMessages += `【用户 ${i + 1}】：` + userMsg + '\n';
    }
    return "【tps战令】：" + allMessages;
}

module.exports = tps;
