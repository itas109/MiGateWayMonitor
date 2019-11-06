//auto.js

//自动启动

let process = require('child_process');

let ChildProcess = process.fork('./index.js');

ChildProcess.on('exit', function (code) {

    console.log('process exits + ' + code);

    if (code !== 0) {
        process.fork('./auto.js');
    }
});