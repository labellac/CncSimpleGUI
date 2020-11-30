const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('COM22', { baudRate: 115200 })
const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
const debugPort = new SerialPort('COM5', { baudRate: 9600 })
const debugParser = debugPort.pipe(new Readline({ delimiter: '\r\n' }))
var fs = require('fs');
var util = require('util');
var coil1log = fs.createWriteStream(__dirname + '/coil1data.log', {flags : 'w'});
var coil2log = fs.createWriteStream(__dirname + '/coil2data.log', {flags : 'w'});

const express = require('express')
var bodyParser = require('body-parser');
const { SSL_OP_EPHEMERAL_RSA } = require('constants')
const app = express()
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const apiPort = 3000
var ready = false;
var debugData=null;
var newDebugData=false;

 
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

app.get('/cnc/api/goto', (req, res) => {
    if (!working) {
        var x = req.query.x;
        var y = req.query.y;
        goTo(x, y).then(() => {
            res.json(getCurrentPositionJson(x, y))
        });
    }
});


app.post('/cnc/api/trace', (req, res) => {
    if (!working) {
        var route = req.body;
        if (route && route.length > 0) {
            processRoute(route);
        }
    }
});

function processRoute(route, index) {
    var i = index || 0;
    acc_coil1=0;
    acc_coil2=0;

    if (i > route.length)
        return;

    var item = route[i];

    goTo(item.x, item.y)
        .then(async() => {
            for(var j=0;j<10;j++)
            {
                while(!newDebugData)
                {
                    await sleep(100);
                }
                newDebugData=false;
                var parsedDebug=debugData.split(';');
                acc_coil1=acc_coil1+Number(parsedDebug[0]);
                acc_coil2=acc_coil2+Number(parsedDebug[2]);
            }
            temp1=acc_coil1/j;
            temp2=acc_coil2/j;
            coil1log.write(item.x+';'+item.y+';'+temp1.toFixed(0)+'\n');
            coil2log.write(item.x+';'+item.y+';'+temp2.toFixed(0)+'\n');
            console.log(debugData);
            acc_coil1=0;
            acc_coil2=0;
            processRoute(route, i + 1);
        });
}

app.use('/cnc', express.static('app'));

app.listen(apiPort, () => {
    console.log(`Example app listening at http://localhost:${apiPort}`)
})

var working = false;
var debugWorking = false;

parser.on('data', function (data) {
    console.log("RECVD: " + data);
    if (data.toLowerCase().indexOf("grbl") >= 0) {
        console.log("Initialized");
        intialize();
    } else if (working && data.toLowerCase() == "ok") {
        console.log("OK");
        working = false;
    }
});

debugParser.on('data', function (data) {
    console.log("RECVD: " + data)
    debugData=data;
    newDebugData=true;
});

function getCurrentPositionJson(x, y) {
    return {
        "position": {
            "x": x,
            "y": y
        }
    };
}

function intialize() {
    console.log("Setting to home");
    goHome().then(() => {
        send("G92X0Y0").then(() => {
            ready = true;
        });
    });
}

function goHome() {
    x = 0;
    y = 0;
    return send("$H");
}

function goTo(x, y) {
    if (x < 0) {
        x = 0;
    }
    if (y < 0) {
        y = 0;
    }
    return send("G0X" + x + "Y" + y);
}

function readDebug() {
    return new Promise(
        (resolve, reject) => {
            var data =null;
            while(true){
                data = debugPort.read()
                if (data && data!=null)
                {
                    break;
                }  
            }
            console.log(data);
            if (!data || data == "") {
                rejects('invalid data')
            } else {
                resolve(data);
            }
        }
    );
}

function send(data) {
    return new Promise(
        (resolve) => {
            console.log(data);
            port.write(data + "\r\n");
            working = true;
            var sendInterval = setInterval(function () {
                if (!working) {
                    clearInterval(sendInterval);
                    resolve();
                }
            }, 100);
        }
    );
}