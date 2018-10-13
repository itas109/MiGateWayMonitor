import json

class xiaomi_data_json(object):
    def __init__(self):
        pass

    def isExistKey(str,key):
        hjson = json.loads(str)
        return key in hjson

    #获取自定义数据
    def get_custom(str,key):
        hjson = json.loads(str)
        if (key in hjson):
            return hjson[key]
        else:
            return ""

    def get_cmd(str):
        hjson = json.loads(str)
        if ('cmd' in hjson):
            return hjson['cmd']
        else:
            return ""


    def get_model(str):
        hjson = json.loads(str)
        if ('model' in hjson):
            return hjson['model']
        else:
            return ""

    #ata为一个整体
    def get_data(str):
        hjson = json.loads(str)
        if ('data' in hjson):
            return hjson['data']
        else:
            return ""

if __name__=='__main__':
    #json_str = '{"cmd":"heartbeat","model":"gateway","sid":"34ce0088f4ad","short_id":"0","token":"F1A9uE3OeIvJVcff","data":"{"ip":"192.168.199.117"}"}'
    json_str = '{"cmd":"heartbeat","model":"gateway","sid":"34ce0088f4ad","short_id":"0","token":"gUZ2dz8lJXZUWEXU",' \
               '"data":"test"}'
    tmp = xiaomi_data_json.get_model(json_str)
    print(tmp)
    tmp = xiaomi_data_json.get_custom(json_str,'model')
    print(tmp)
    tmp = xiaomi_data_json.get_custom(json_str,'model1')
    print(tmp)
