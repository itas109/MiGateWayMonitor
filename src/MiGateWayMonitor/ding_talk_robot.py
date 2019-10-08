import requests
import json

import global_config as gl

url = gl.dingTalkUrl
HEADERS = {
"Content-Type": "application/json ;charset=utf-8 "
}

class iDingTalkRobot(object):
    def sendText(self,text):
        textMsg = {
        "msgtype": "text",
        "text": {"content": text}
        }
        textMsg = json.dumps(textMsg)
        res = requests.post(url, data=textMsg, headers=HEADERS)
        obj = json.loads(res.text)
        if obj["errcode"] == 0 :
            return True
        else :
            return False

if __name__=='__main__':
    text = "测试数据"
    dingTalkRobot = iDingTalkRobot()
    bRet = dingTalkRobot.sendText(text)
    if bRet:
        print("钉钉消息发送成功")
    else:
        print("钉钉消息发送失败")