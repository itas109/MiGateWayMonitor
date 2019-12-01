'use strict';

const fs = require('fs');
const path = require('path');

// 全局根目录路径
global.globalRootDir = path.dirname(require.main.filename);
// 全局配置文件路径
global.globalConfigPath = path.join(globalRootDir,'/Config/config.js');


global.globalLogger = require('./LogHelper/log_helper.js').logger;
let globalConfig = undefined;
try {
    globalConfig = require(globalConfigPath).globalConfig;

} catch (error) {
    globalLogger.error('请修改Config目录下config.js.example的参数，并重命名为config.js');
    return;
}

globalLogger.setLevel(globalConfig.logLevel);

try {
    fs.watchFile(globalConfigPath, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
            globalLogger.info('config.js is changed. system reload config about it.');

            reLoadConfig();
        }
    });

    globalLogger.info('file watching. ' + globalConfigPath);
} catch (error) {
    globalLogger.error(error);
}

require

// UDP组播
const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const multicastAddr = globalConfig.miGatewayInfo.udpMulticastAddr;
const multicastPort = globalConfig.miGatewayInfo.udpMulticastPort;

// 消息模块
const SendMsgAll = require('./sendMsgAll.js');
global.globalSendMsg = new SendMsgAll();
globalSendMsg.init(globalConfig);

// 业务模块
const business = require('./business.js');

// 定时器
const schedule = require('node-schedule');

// 时间
const moment = require('moment');
// 设置简体中文
moment.locale('zh-cn');

// 程序启动时间
let appStartTime = moment().format('YYYY-MM-DD HH:mm:ss');

// 全局数据存储
let globalMiData = {}

// 获取当前时间戳
let watchDogTime = Date.now();

client.on('close', () => {
    globalLogger.info('socket已关闭');
});

client.on('error', (err) => {
    globalLogger.error(err);

    globalSendMsg.sendMsgAll('程序出错了...');
});

client.on('listening', () => {
    globalLogger.info(`已加入udp组播 ${multicastAddr}, 端口 ${multicastPort}`);
    client.addMembership(multicastAddr);

    sendMsg.sendMsgAll('程序启动...');
});

client.on('message', (msg, rinfo) => {
    watchDogTime = Date.now();
    //globalLogger.info(`receive message from ${rinfo.address}:${rinfo.port}：${msg}`);
    try {
        //{"cmd":"heartbeat","model":"gateway","sid":"3412e008774ad","short_id":"0","token":"zUNAahM16GPi88B1","data":"{\"ip\":\"192.168.1.100\"}"}
        let jsonObj = JSON.parse(msg);

        let key = jsonObj['model'] + "_" + jsonObj['sid'] + "_" + jsonObj['cmd'];
        let value = {};
        value['data'] = jsonObj['data'];
        value['time'] = moment().format('YYYY-MM-DD HH:mm:ss');

        globalLogger.debug(`${key} : ` + JSON.stringify(value));

        // 数据存储
        globalMiData[key] = value;

        // 业务处理
        business.business(jsonObj);
    } catch (error) {
        globalLogger.error(error);
    }
});

client.bind(multicastPort);

// 看门狗任务 每分钟检查两次
schedule.scheduleJob('0,30 * * * * *', () => {
    if (Date.now() - watchDogTime > globalConfig.watchDogTimeout) {

        sendMsg.sendMsgAll('看门狗超时，程序重启');

        process.exit(1);
    }
});

// 定时任务
let task1 = schedule.scheduleJob(globalConfig.scheduleRule, () => {
    let info = '家庭卫士程序心跳包\n\n连续运行 : ' + moment(appStartTime).fromNow(true) + '(' + appStartTime + ')\n\n' + JSON.stringify(globalMiData);

    sendMsg.sendMsgAll(info);
});

// 重载配置文件
function reLoadConfig() {
    try {
        delete require.cache[globalConfigPath];

        globalConfig = require(globalConfigPath).globalConfig;

        globalLogger.setLevel(globalConfig.logLevel);

        globalSendMsg.init(globalConfig);

        schedule.rescheduleJob(task1, globalConfig.scheduleRule);
    } catch (error) {
        globalLogger.error(error);
    }
}