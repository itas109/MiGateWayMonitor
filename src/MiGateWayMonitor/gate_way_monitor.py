#!/usr/bin/env python
# -*- coding:utf-8 -*-

from logger import Logger
import xiaomi_data_json
import twilio_sms
import i_email
import schedule #pip install schedule
import socket
import sys

import global_config as gl

version = "MiGatewayMonitor v1.0.0.181013"

def get_gateway_heart():
    SENDERIP = "0.0.0.0"
    MYPORT = 9898
    MYGROUP = '224.0.0.50'

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    #allow multiple sockets to use the same PORT number
    sock.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1)
    #Bind to the port that we know will receive multicast data
    sock.bind((SENDERIP,MYPORT))
    #tell the kernel that we are a multicast socket
    #sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 255)
    #Tell the kernel that we want to add ourselves to a multicast group
    #The address for the multicast group is the third param
    status = sock.setsockopt(socket.IPPROTO_IP,
                             socket.IP_ADD_MEMBERSHIP,
                             socket.inet_aton(MYGROUP) + socket.inet_aton(SENDERIP))

    data, addr = sock.recvfrom(1024)
    data_str=str(data,encoding='utf-8')
    sock.close()
    return data_str

def send_family_email(email_content):
    receivers = gl.email_send # 接收邮件，可设置为你的QQ邮箱或者其他邮箱
    mail_tile = '家庭卫士'
    mail = i_email.iEmail()
    bRet = mail.send_mail(receivers, email_content, mail_tile)
    if bRet:
        print("邮件发送成功")
    else:
        print("邮件发送失败")

sys.stdout = Logger()

if __name__=='__main__':
     data_json = xiaomi_data_json.xiaomi_data_json
     sms = twilio_sms.sms_client
     mail = i_email.iEmail()

     info = '家庭卫士程序启动'
     send_family_email(info)

    #定时任务
     info = '家庭卫士程序心跳包'
     schedule.every().day.at("13:00").do(send_family_email,info)

     while True:
         schedule.run_pending()
         udp_group_data = get_gateway_heart()
         print(udp_group_data)
         model = data_json.get_model(udp_group_data)
         if model == 'sensor_wleak.aq1':#水浸传感器
             cmd = data_json.get_cmd(udp_group_data)
             if cmd == 'report':#只处理上报数据
                 data = data_json.get_data(udp_group_data)#获取状态数据
                 status = data_json.get_custom(data,'status')
                 if status == 'leak':#发生水浸则发送短信
                     #send message
                     info = 'leak lou shui bao jing'
                     print(info)
                     sms.send_sms(gl.sms_send1, info)
                     sms.send_sms(gl.sms_send2, info)
                     info = '水浸传感器报警'
                     send_family_email(info)
                 elif status == 'no_leak' :#报警但是并没有发生水浸
                     # send message
                     info = 'no_leak bao jing jie chu'
                     print(info)
                     sms.send_sms(gl.sms_send2,info)
                     sms.send_sms(gl.sms_send2, info)
                     info = '水浸传感器报警解除'
                     send_family_email(info)
                 else:
                     pass
             else:
                 pass
         else:#其他传感器
             pass