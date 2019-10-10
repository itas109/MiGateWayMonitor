#!/usr/bin/env python3.5
# coding=utf-8

import sys
import datetime

import os

#创建文件夹
def mkdir(path):
    folder = os.path.exists(path)
    if not folder:  # 判断是否存在文件夹如果不存在则创建为文件夹
        os.makedirs(path)  # makedirs 创建文件时如果路径不存在会创建这个路径

class Logger(object):
    def __init__(self):
        self.terminal=sys.stdout


    def write(self,msg):
        folder = "log/"
        mkdir(folder)
        self.log = open(folder + str(datetime.date.today()) + ".log", "a")

        if msg != '\n':
            out = "[ %s ] - %s \n" %(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),msg)
            self.terminal.write(out)
            self.log.write(out)

        self.log.close()

    def flush(self):
        pass

if __name__ == '__main__':
    sys.stdout = Logger()
    print("abc123")

