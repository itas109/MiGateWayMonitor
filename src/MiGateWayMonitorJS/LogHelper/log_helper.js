/**
 * @file            log_helper.js
 * @description     日志输出类
 * @author 	        itas109
 * @createDate      2019 / 09 / 04
 * @version	        V1.0.2.191021
 * V1.0.1.190905 - 1.修复格式化字符串不能正常输出问题 2.增加文件名和行号
 * V1.0.2.191021 - 1.增加setLevel函数，用于控制日志输出界别 2.优化初始化配置 3.临时注释error输出，会卡界面
 */

var logger = {};
exports.logger = logger;

var fs = require("fs");
var path = require("path");
var log4js = require('./log4js/lib/log4js');

try {
    var objConfig = JSON.parse(fs.readFileSync(__dirname+"/Config/log.json", "utf8"));//TODO:暂时屏蔽配置文件
    log4js.configure(objConfig);
} catch (error) {
    //console.log(error);
    // 加载失败后，使用默认配置
    log4js.configure({
        //输出位置的基本信息设置
        appenders: {
            //设置控制台输出 （默认日志级别是关闭的（即不会输出日志））
            out: { type: 'console', layout:{type:'pattern',pattern:'%[[%d] [%p] %X{line}%] - %m'} },
            //设置每天：以日期为单位,数据文件类型，dataFiel   注意设置pattern，alwaysIncludePattern属性
            //文件最大值maxLogSize 单位byte (B->KB->M) backups:备份的文件个数最大值,最新数据覆盖旧数据
            allLog: { type: 'dateFile', filename: './logs/app', pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true, maxLogSize: 10485760, backups: 3, layout:{type:'pattern',pattern:'[%d] [%p] %X{line} - %m'} },
    
            //所有日志记录，文件类型file   文件最大值maxLogSize 单位byte (B->KB->M) backups:备份的文件个数最大值,最新数据覆盖旧数据
            //allLog: { type: 'file', filename: './logs/all.log', keepFileExt: true, maxLogSize: 10485760, backups: 3 },
    
            //http请求日志  http请求日志需要app.use引用一下， 这样才会自动记录每次的请求信息 
            // httpLog: { type: "dateFile", filename: "log/httpAccess.log", pattern: ".yyyy-MM-dd", keepFileExt: true },
    
            //错误日志 type:过滤类型logLevelFilter,将过滤error日志写进指定文件
            //文件最大值maxLogSize 单位byte (B->KB->M) backups:备份的文件个数最大值,最新数据覆盖旧数据
            // errorLog: { type: 'file', filename: './logs/error', pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true, maxLogSize: 10485760, backups: 3, layout:{type:'pattern',pattern:'[%d] [%p] %X{line} - %m'}  },
            // error: { type: "logLevelFilter", level: "error", appender: 'errorLog' }
        },
        //不同等级的日志追加到不同的输出位置：appenders: ['out', 'allLog']  categories 作为getLogger方法的键名对应
        categories: {
            //appenders:采用的appender,取上面appenders项,level:设置级别
            //http: { appenders: ['out','httpLog'], level: "debug" },
            default: { appenders: ['out', 'allLog'/*, 'error'*/], level: 'debug'},
        }
    
    });
}

var getStackTrace = function() {
    var obj = {};
    Error.captureStackTrace(obj,getStackTrace);
    return obj.stack;
}

var getFileNameAndLine = function(stack){
    var matchResult = stack.match(/\(.*?\)/g) || [];
    var callerStackLine = matchResult[1] || "";
    return `[${callerStackLine.substring(callerStackLine.lastIndexOf(path.sep) + 1, callerStackLine.lastIndexOf(':'))}]`;
}

const _logger = log4js.getLogger();

// logger.trace = function (...msg) {
//     _logger.addContext('line',getFileNameAndLine(getStackTrace()));
//     _logger.trace(...msg);
// }

logger.setLevel= function (level) {
    _logger.level = level;
}

logger.debug = function (...msg) {
    _logger.addContext('line',getFileNameAndLine(getStackTrace()));
    _logger.debug(...msg);
}

logger.info = function (...msg) {
    _logger.addContext('line',getFileNameAndLine(getStackTrace()));
    _logger.info(...msg);
}

logger.warn = function (...msg) {
    _logger.addContext('line',getFileNameAndLine(getStackTrace()));
    _logger.warn(...msg);
}

logger.error = function (...msg) {
    _logger.addContext('line',getFileNameAndLine(getStackTrace()));
    _logger.error(...msg);
}

logger.fatal = function (...msg) {
    _logger.addContext('line',getFileNameAndLine(getStackTrace()));
    _logger.fatal(...msg);
}

logger.log = function (level,...msg) {
    _logger.addContext('line',getFileNameAndLine(getStackTrace()));
    _logger.log(level,...msg);
}

exports = module.exports = { logger };