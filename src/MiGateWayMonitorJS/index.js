'use strict';

global.logger = require("./LogHelper/log_helper").logger;
let globalConfig = undefined;
try {
    globalConfig = require("./Config/config").globalConfig;

} catch (error) {
    logger.error('请修改Config目录下config.js.example的参数，并重命名为config.js');
    return;
}

logger.setLevel(globalConfig.logLevel);

// UDP组播
const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const multicastAddr = globalConfig.miGatewayInfo.udpMulticastAddr;
const multicastPort = globalConfig.miGatewayInfo.udpMulticastPort;

// 消息模块
const SendMsgAll = require('./sendMsgAll');
global.sendMsg = new SendMsgAll(globalConfig);

// 业务模块
const business = require('./business');

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
    logger.info('socket已关闭');
});

client.on('error', (err) => {
    logger.error(err);

    sendMsg.sendMsgAll('程序出错了...');
});

client.on('listening', () => {
    logger.info(`已加入udp组播 ${multicastAddr}, 端口 ${multicastPort}`);
    client.addMembership(multicastAddr);

    sendMsg.sendMsgAll('程序启动...');
});

client.on('message', (msg, rinfo) => {
    watchDogTime = Date.now();
    //logger.info(`receive message from ${rinfo.address}:${rinfo.port}：${msg}`);
    try {
        //{"cmd":"heartbeat","model":"gateway","sid":"3412e008774ad","short_id":"0","token":"zUNAahM16GPi88B1","data":"{\"ip\":\"192.168.1.100\"}"}
        let jsonObj = JSON.parse(msg);

        let key = jsonObj['model'] + "_" + jsonObj['sid'] + "_" + jsonObj['cmd'];
        let value = {};
        value['data'] = jsonObj['data'];
        value['time'] = moment().format('YYYY-MM-DD HH:mm:ss');

        logger.debug(`${key} : ` + JSON.stringify(value));

        // 数据存储
        globalMiData[key] = value;

        // 业务处理
        business.business(jsonObj);
    } catch (error) {
        logger.error(error);
    }
});

client.bind(multicastPort);

// 看门狗任务 每分钟检查两次
schedule.scheduleJob('0,30 * * * * *',()=>{
    if( Date.now() - watchDogTime > globalConfig.watchDogTimeout){

        sendMsg.sendMsgAll('看门狗超时，程序重启');

        process.exit(1);
    }
}); 

// 定时任务
schedule.scheduleJob(globalConfig.scheduleRule,()=>{
    let info  = '家庭卫士程序心跳包\n\n连续运行 : ' + moment(appStartTime).fromNow(true) + '('+ appStartTime +')\n\n' + JSON.stringify(globalMiData);

    sendMsg.sendMsgAll(info);
}); 