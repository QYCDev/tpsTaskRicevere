/*
cron "40 9 * * *" DailyCheck.js, tag=每日签到合集
*/
const yaml = require("js-yaml");
const fs = require('fs');
const task = require('./scripts/tps.js');
let QL = process.env.QL_DIR
config = null, notify = null, signlist = [], logs = "", needPush = false
if (fs.existsSync("./sendNotify.js")) notify = require('./sendNotify')

async function go() {
    if (QL) {
        if (!fs.existsSync(`/${QL}/data/config/DailyCheck_config.yml`)) {
            console.log("您还没有填写cookies配置文件,请配置好再来运行8...\n配置文件路径/ql/data/config/DailyCheck_config.yml\n如没有文件复制一份DailyCheck_config.yml.temple并改名为DailyCheck_config.yml")
            return;
        } else {
            if (yaml.load) config = yaml.load(fs.readFileSync(`/${QL}/data/config/DailyCheck_config.yml`, 'utf8'))
            else console.log("亲,您的依赖掉啦,但是没有完全掉 请重装依赖\npnpm install  axios crypto-js fs js-yaml\n或者\nnpm install  axios crypto-js fs js-yaml")
        }
    }
    await start()
}

function start() {
    return new Promise(async (resolve) => {
        try {
            taskResult = await task()
            if (taskResult && taskResult.match(/单独通知|cookie|失效|失败|出错|重新登录/)) await sendmsg(taskResult)
            else logs += taskResult + "    \n\n";
            console.log("------------任务执行完毕------------\n");
            if (needPush && notify) await sendmsg(logs);
        } catch (err) {
            console.log(err);
        }
        resolve();
    });
}

async function sendmsg(msg){
    await notify.sendNotify(`战令领取完毕`, msg.replace(/\n/g,"\n\n"))
}

!(async () => {
    await go();
})()