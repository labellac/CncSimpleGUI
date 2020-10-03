const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('COM22', { baudRate: 115200 });
const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
const express = require('express')
const app = express()
const apiPort = 3000
var ready = false;


app.get('/cnc/api/goto', (req, res) => {
    if (!working){
        var x = req.query.x;
        var y = req.query.y;
        goTo(x,y).then(()=>{
            res.json(getCurrentPositionJson(x,y))
        });
    }
});

app.use('/cnc', express.static('app'));

app.listen(apiPort, () => {
  console.log(`Example app listening at http://localhost:${apiPort}`)
})

var working=false;

parser.on('data', function (data) {
    console.log("RECVD: "+data);
    if (data.toLowerCase().indexOf("grbl")>=0){
        console.log("Initialized");
        intialize();
    }else if (working && data.toLowerCase()=="ok"){
        console.log("OK");
        working=false;
    }
});

function getCurrentPositionJson(x,y){
    return {
        "position": {
            "x":x,
            "y":y
        }
    };
}

function intialize(){
    console.log("Setting to home");
    goHome().then(()=> { 
        send("G92X0Y0").then(()=>{
            ready=true;
        }); 
    });
}

function goHome(){
    x=0;
    y=0;
    return send("$H");
}

function goTo(x,y){
    if (x<0){
        x=0;
    }
    if (y<0){
        y=0;
    }
    return send("G0X"+x+"Y"+y);
}

function send(data){
    return new Promise(
        (resolve) => {
            console.log(data);
            port.write(data+"\r\n");
            working=true;
            var sendInterval = setInterval(function(){
                if (!working){
                    clearInterval(sendInterval);
                    resolve();
                }
              }, 100);
        }
    );
}