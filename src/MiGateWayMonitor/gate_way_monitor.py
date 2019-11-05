#!/usr/bin/env python
# -*- coding:utf-8 -*-

import json
from logger import Logger
import xiaomi_data_json
import twilio_sms
import i_email
import schedule  # pip install schedule
import socket
import sys
import os
import net_reconnect
import ding_talk_robot

import datetime

import global_config as gl

name = "MiGatewayMonitor"
version = "v1.0.2.191008"

# 全局消息
globalMiData = {}

def get_gateway_heart():
    SENDERIP = "0.0.0.0"
    MYPORT = 9898
    MYGROUP = '224.0.0.50'

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    # allow multiple sockets to use the same PORT number
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    # Bind to the port that we know will receive multicast data
    sock.bind((SENDERIP, MYPORT))
    # tell the kernel that we are a multicast socket
    # sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 255)
    # Tell the kernel that we want to add ourselves to a multicast group
    # The address for the multicast group is the third param
    status = sock.setsockopt(socket.IPPROTO_IP,
                             socket.IP_ADD_MEMBERSHIP,
                             socket.inet_aton(MYGROUP) + socket.inet_aton(SENDERIP))

    # 设置61秒超时，防止阻塞网络检测等
    sock.settimeout(61)

    data, addr = sock.recvfrom(1024)
    data_str = str(data, encoding='utf-8')
    sock.close()
    return data_str

# 检测程序
def mi_run():
    udp_group_data = get_gateway_heart()
    # print(udp_group_data)
    global globalMiData
    # 通过sid分组
    udp_group_data_json = json.loads(udp_group_data)
    # 增加时间戳
    udp_group_data_json["time"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    globalMiData[data_json.get_custom(udp_group_data,'sid')] = udp_group_data_json
    print(globalMiData)
    # send_ding_talk(globalMiData)
    model = data_json.get_model(udp_group_data)
    if model == 'sensor_wleak.aq1':  # 水浸传感器
        cmd = data_json.get_cmd(udp_group_data)
        if cmd == 'report':  # 只处理上报数据
            data = data_json.get_data(udp_group_data)  # 获取状态数据
            status = data_json.get_custom(data, 'status')

            if status == 'leak':  # 发生水浸则发送短信
                info = '水浸传感器报警'
                send_all_msg(info)
                # send message
                info = 'leak lou shui bao jing'
                print(info)
                sms.send_sms(gl.sms_send1, info)
                sms.send_sms(gl.sms_send2, info)
            elif status == 'no_leak':  # 报警但是并没有发生水浸
                info = '水浸传感器报警解除'
                send_all_msg(info)
                # send message
                info = 'no_leak bao jing jie chu'
                print(info)
                sms.send_sms(gl.sms_send2, info)
                sms.send_sms(gl.sms_send2, info)
            else:
                pass
        else:
            pass
    else:  # 其他传感器
        pass

# 发送邮件
def send_family_email(email_content):
    receivers = gl.email_send  # 接收邮件，可设置为你的QQ邮箱或者其他邮箱
    mail_tile = '家庭卫士 ' + version
    mail = i_email.iEmail()
    bRet = mail.send_mail(receivers, email_content, mail_tile)
    if bRet:
        print("邮件发送成功")
    else:
        print("邮件发送失败")

# 发送钉钉
def send_ding_talk(text):
    dingTalkRobot = ding_talk_robot.iDingTalkRobot()
    dingTalkRobot.sendText(text)

# 发送消息：邮件、钉钉、短信等
def send_all_msg(text):
    send_family_email(text)
    send_ding_talk(text)

# 重启程序
def restart_program():
    python = sys.executable
    os.execl(python, python, *sys.argv)
    print("restart_program")

# 网络检测
def netCheck():
    bRet = net_reconnect.is_reachable("www.baidu.com") | net_reconnect.is_reachable("www.baidu.com")
    # print(bRet)
    if (bRet):
        print("network ok")
    else:
        info = '网络异常，重启程序...'
        print(info)
        send_all_msg(info)
        # 重启程序
        restart_program()

def sendMiData():
    global globalMiData
    send_ding_talk(globalMiData);

def sendHeartbeatData():
    global globalMiData
    info = '家庭卫士程序心跳包\n' + json.dumps(globalMiData)
    send_all_msg(info)

sys.stdout = Logger()

data_json = xiaomi_data_json.xiaomi_data_json
sms = twilio_sms.sms_client
# mail = i_email.iEmail()
# dingTalkRobot = ding_talk_robot.iDingTalkRobot()

if __name__ == '__main__':
    info = '家庭卫士程序启动'
    print(info)
    send_all_msg(info)

    # 定时任务1
    schedule.every().day.at("13:10").do(sendHeartbeatData)

    # 定时任务2
    # schedule.every(10).seconds.do(netCheck)
    schedule.every(30).minutes.do(netCheck)

    # 定时任务3
    schedule.every().day.at("8:55").do(sendMiData)
    schedule.every().day.at("18:05").do(sendMiData)

    while True:
        schedule.run_pending()
        try:
            mi_run()
        except Exception as e:
            print('mi_run Error:', e)