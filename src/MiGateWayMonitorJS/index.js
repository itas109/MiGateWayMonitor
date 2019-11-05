'use strict';

global.logger = require("./LogHelper/log_helper").logger;
let globalConfig =  undefined;
try {
    globalConfig =  require("./Config/config").globalConfig;

} catch (error) {
    logger.error('请修改Config目录下config.js.example的参数，并重命名为config.js');
    return;
}

logger.setLevel(globalConfig.logLevel);

const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const multicastAddr = globalConfig.miGatewayInfo.udpMulticastAddr;
const multicastPort = globalConfig.miGatewayInfo.udpMulticastPort;

client.on('close', () => {
    logger.info('socket已关闭');
});

client.on('error', (err) => {
    logger.error(err);
});

client.on('listening', () => {
   logger.info(`已加入udp组播 ${multicastAddr}, 端口 ${multicastPort}`);
    client.addMembership(multicastAddr);
});

client.on('message', (msg, rinfo) => {
    //logger.info(`receive message from ${rinfo.address}:${rinfo.port}：${msg}`);
    let obj = JSON.parse(msg);
   logger.debug(JSON.stringify(obj));
});

client.bind(multicastPort);