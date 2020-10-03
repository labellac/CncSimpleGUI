var x=0;
var y=0;
var canvas = document.getElementById("cnc");
var positionData = document.getElementById("position");
var xInput = document.getElementById("x");
var yInput = document.getElementById("y");

// That's how you define the value of a pixel //
function drawPixel (x, y, r, g, b, a) {
    var index = (x + y * canvasWidth) * 4;

    canvasData.data[index + 0] = r;
    canvasData.data[index + 1] = g;
    canvasData.data[index + 2] = b;
    canvasData.data[index + 3] = a;
}

// That's how you update the canvas, so that your //
// modification are taken in consideration //
function updateCanvas() {
    ctx.putImageData(canvasData, 0, 0);
}


function up(){
    y++;
    sendGoTo(x,y).then((data)=>
        console.log("SERVER DATA: "+data)
    );
}

function down(){
    y--;
    if (y<0)y=0;
    sendGoTo(x,y).then((data)=>
        console.log("SERVER DATA: "+data)
    );
}

function left(){
    x--;
    if (x<0)x=0;
    sendGoTo(x,y).then((data)=>
        console.log("SERVER DATA: "+data)
    );
}

function right(){
    x++;
    sendGoTo(x,y).then((data)=>
        console.log("SERVER DATA: "+data)
    );
}
function gotoXY(){
    x= parseInt(xInput.value);
    y= parseInt(yInput.value);
    sendGoTo(x,y);
}

function sendGoTo(x,y){
    return fetch('/cnc/api/goto?x='+x+'&y='+y, {
        method: 'GET'
    }).then(function (response) {
        if (response.ok) {
            response.json().then((data)=>{
                positionData.value = "X: "+data.position.x+" Y: "+data.position.y;
            });
        }
        return Promise.reject(response);
    }).then(function (data) {
        console.log(data);
    }).catch(function (error) {
        console.warn('Something went wrong.', error);
    });
}
