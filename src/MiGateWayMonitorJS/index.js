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

// 全局数据存储
let globalMiData = {}


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
    //logger.info(`receive message from ${rinfo.address}:${rinfo.port}：${msg}`);
    try {
        let jsonObj = JSON.parse(msg);

        jsonObj['time'] = new Date().toLocaleString();

        logger.debug(JSON.stringify(jsonObj));

        // 数据存储
        globalMiData[jsonObj['sid']] = jsonObj;
    
        // 业务处理
        business.business(jsonObj);
        } catch (error) {
        logger.error(error);
    }
});

client.bind(multicastPort);

schedule.scheduleJob(globalConfig.scheduleRule,()=>{
    let info  = '家庭卫士程序心跳包\n\n' + JSON.stringify(globalMiData);

    sendMsg.sendMsgAll(info);
}); 