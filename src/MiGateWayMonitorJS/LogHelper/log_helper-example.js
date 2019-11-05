var logger = require("./log_helper").logger;

var count = 0;

// 设置日志级别
// logger.setLevel('all');
// logger.setLevel('debug');
// logger.setLevel('info');
logger.setLevel('warn');
// logger.setLevel('error');
// logger.setLevel('fatal');
// logger.setLevel('off');

logger.debug("hello : %d",count++);
logger.info("hello : %d",count++);
logger.warn("hello : %d",count++);
logger.error("hello : %d",count++);
logger.fatal("hello : %d",count++);

logger.info("-------------------------");

logger.log("debug","hello : %d",count++);
logger.log("info","hello : %d",count++);
logger.log("warn","hello : %d",count++);
logger.log("error","hello : %d",count++);
logger.log("fatal","hello : %d",count++);