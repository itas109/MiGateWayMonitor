'use strict';

global.logger = require("./LogHelper/log_helper").logger;
let globalConfig =  require("./Config/config").globalConfig;

logger.setLevel(globalConfig.logLevel);

const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const multicastAddr = '224.0.0.50';
const multicastPort = 9898;

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