from twilio.rest import Client

#pip install twilio

#raspberry: sudo pip3 install twilio

import global_config as gl

client = Client(gl.account_sid, gl.auth_token)

class sms_client(object):
    def __init__(self):
        pass

    def send_sms(to_phone,msg):
        message = client.messages.create(
            to="+86"+to_phone,# 区号+你的手机号码
            from_=gl.twilio_number,# 你的 twilio 电话号码
            body=msg)#unicode body: 1600字符限制
        if(message.status == 'queued'):
            return True
        else:
            return False

if __name__=='__main__':
    msg = sms_client.send_sms('xxx','i am ok')
    print(msg)