var x = 0;
var y = 0;
var canvas = document.getElementById("cnc");
var positionData = document.getElementById("position");
var routeData = document.getElementById("route");
var xInput = document.getElementById("x");
var yInput = document.getElementById("y");

// That's how you define the value of a pixel //
function drawPixel(x, y, r, g, b, a) {
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


function up() {
    y++;
    sendGoTo(x, y).then((data) =>
        console.log("SERVER DATA: " + data)
    );
}

function down() {
    y--;
    if (y < 0) y = 0;
    sendGoTo(x, y).then((data) =>
        console.log("SERVER DATA: " + data)
    );
}

function left() {
    x--;
    if (x < 0) x = 0;
    sendGoTo(x, y).then((data) =>
        console.log("SERVER DATA: " + data)
    );
}

function right() {
    x++;
    sendGoTo(x, y).then((data) =>
        console.log("SERVER DATA: " + data)
    );
}
function gotoXY() {
    x = parseInt(xInput.value);
    y = parseInt(yInput.value);
    sendGoTo(x, y);
}

function sendGoTo(x, y) {
    return fetch('/cnc/api/goto?x=' + x + '&y=' + y, {
        method: 'GET'
    }).then(function (response) {
        if (response.ok) {
            response.json().then((data) => {
                positionData.value = "X: " + data.position.x + " Y: " + data.position.y;
            });
        }
        return Promise.reject(response);
    }).then(function (data) {
        console.log(data);
    }).catch(function (error) {
        console.warn('Something went wrong.', error);
    });
}

function sampleYZigZagRoute() {
    var route = [];
    var upDirection=true;
    const xmin=0;
    const xmax=40;
    const ymin=11;
    const ymax=65;
    for (var x = xmin; x <= xmax; x++) {
        for (var y = ymin; y <= ymax; y++) {
            if (upDirection)
            {
                route.push({ "x": x, "y": y });
            }
            else
            {
                route.push({ "x": x, "y": ymax+ymin-y });
            }
        }
        upDirection=!upDirection;        
    }
    sendRoute(route);
}

function calibrateCoil1() {
    var route = [];
    const x=3;
    const ymin=8;
    const ymax=38;
    
    for (var y = ymax; y >= ymin; y--) {
        route.push({ "x": x, "y": y });
    }
    sendRoute(route);
}

function calibrateCoil2() {
    var route = [];
    const x=37;
    const ymin=8;
    const ymax=38;
    
    for (var y = ymax; y >= ymin; y--) {
        route.push({ "x": x, "y": y });
    }
    sendRoute(route);
}

function traceReoute() {
    var route = routeData.value;
    sendRoute(JSON.parse(route));
}

function sendRoute(route) {
    return fetch('/cnc/api/trace', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(route)
    });
}

