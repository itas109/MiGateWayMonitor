// 钉钉
const ChatBot = require('dingtalk-robot-sender');

// 邮箱
let nodemailer = require("nodemailer");

class SendMsgAll {
    constructor(globalConfig) {
        this.dingTalkRobot = new ChatBot({
            webhook: globalConfig.dingTalkInfo.dingTalkUrl
        });

        let emailUrl = 'smtps://' + globalConfig.emailInfo.fromAddr + ':' + globalConfig.emailInfo.pwd + '@' + globalConfig.emailInfo.host;
        this.transporter = nodemailer.createTransport(emailUrl);

        this.mailOptions = {
            from: '"邮件助手" <' + globalConfig.emailInfo.fromAddr + '>', //发信邮箱
            to: globalConfig.emailInfo.sendList, //接收者邮箱
            subject: globalConfig.version, //邮件主题
            text: "",
        };
    }

    sendMsgAll(text) {
        // 钉钉
        this.dingTalkRobot.text(text);

        // 邮件
        this.mailOptions.text = text;
        this.transporter.sendMail(this.mailOptions);

        // 日志
        global.logger.info(text);
    }
}

module.exports = SendMsgAll;
