/**
 * 业务处理
 * @param {*} jsonObj 
 */
function business(jsonObj) {
    // global.logger.debug(jsonObj);

    if (typeof (jsonObj) === 'object') {
        if (jsonObj.model === 'sensor_wleak.aq1') { // 水浸传感器
            //  发生水浸 {"cmd":"report","model":"sensor_wleak.aq1","sid":"xxx","short_id":xxx,"data":"{\"status\":\"leak\"}"}
            //  解除水浸 {"cmd":"report","model":"sensor_wleak.aq1","sid":"xxx","short_id":xxx,"data":"{\"status\":\"no_leak\"}"}
            if (jsonObj.cmd == 'report') { // 只处理上报数据
                let dataObj = JSON.parse(jsonObj.data);
                if (dataObj.status === 'leak') {
                    sendMsg.sendMsgAll('水浸传感器发生报警');
                } else if (dataObj.status === 'no_leak') {
                    sendMsg.sendMsgAll('水浸传感器解除报警');
                } else {

                }
            }
        }
    }

}

exports.business = business;