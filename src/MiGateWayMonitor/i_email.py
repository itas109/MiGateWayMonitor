#!/usr/bin/python
# -*- coding: UTF-8 -*-

#smtplib python3自带
#pip install email

import global_config as gl

import smtplib
from email.mime.text import MIMEText
from email.header import Header

class iEmail(object):
    def send_mail(self,receivers,mail_content,mail_tile,from_mail_adderss = '邮件助手'):
        message = MIMEText(mail_content, 'plain', 'utf-8')
        message['Subject'] = Header(mail_tile, 'utf-8')#邮件主题
        message['From'] = Header(from_mail_adderss, 'utf-8')  # 发件人昵称
        # message['To'] = Header("测试", 'utf-8') #收件人昵称
        try:
            smtpObj = smtplib.SMTP()
            #smtpObj.set_debuglevel(1)
            smtpObj.connect(gl.mail_host, 25)  # 25 为 SMTP 端口号
            smtpObj.login(gl.mail_user, gl.mail_pass)
            smtpObj.sendmail(gl.mail_from_addr, receivers, message.as_string())
            smtpObj.quit()  # 关闭连接
            return True
        except smtplib.SMTPException:
            return False

if __name__=='__main__':
    receivers = ['itas109@qq.com']  # 接收邮件，可设置为你的QQ邮箱或者其他邮箱
    email_content = 'test'
    mail_tile = 'mail_tile_test'
    mail = iEmail()
    bRet = mail.send_mail(receivers,email_content,mail_tile)
    if bRet:
        print("邮件发送成功")
    else:
        print("邮件发送失败")