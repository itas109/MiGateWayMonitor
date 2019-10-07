#!/usr/bin/env python3.5
# coding=utf-8

import subprocess
import platform

import threading

def is_reachable(ip):
    iRet = -1;
    sysName = platform.system();
    if(sysName == "Linux"):
        iRet = subprocess.call(["ping", "-c", "4", ip]);
    elif(sysName == "Windows"):
        iRet = subprocess.call(["ping", ip]);

    if iRet==0:#只发送两个ECHO_REQUEST包
        # print("{0} is alive.".format(ip))
        return True
    else:
        # print("{0} is unalive".format(ip))
        return False

if __name__  == "__main__":

    print("{0}".format(is_reachable("www.baidu.com")))

    # ips = ["www.baidu.com","192.168.199.999"]
    # threads = []
    # for ip in ips:
    #     thr = threading.Thread(target=is_reachable, args=(ip,))#参数必须为tuple形式
    #     thr.start()#启动
    #     threads.append(thr)
    # for thr in threads:
    #     thr.join()