if (!window.WebSocket && window.MozWebSocket) {
    window.WebSocket = window.MozWebSocket;
}

if (!window.WebSocket) {
    alert("WebSocket not supported by this browser");
}

function $() {
    return document.getElementById(arguments[0]);
}
function $F() {
    return document.getElementById(arguments[0]).value;
}

function getKeyCode(ev) {
    if (window.event)
        return window.event.keyCode;
    return ev.keyCode;
}

var wstool = {

    // Ouverture de websocket client
    connect : function() {
        var location = document.location.toString().replace('http://', 'ws://');
        wstool.log("info", "Document URI: " + document.location);
        wstool.log("info", "WS URI: " + location);

        try {
            this._ws = new WebSocket(location);
            this._ws.onopen = this._onopen;
            this._ws.onmessage = this._onmessage;
            this._ws.onclose = this._onclose;
            this._ws.url = "ws://localhost:8080/"
        } catch (exception) {
            wstool.log("error", "Connect Error: " + exception);
        }
    },

    // Fermeture du websocket
    close : function() {
        this._ws.close(1000);
    },

    // Accessibilité des boutons selon l'état de la connexion
    setState : function(enabled) {
        $('connect').disabled = enabled;
        $('disconnect').disabled = !enabled;
        $('startChenillard').disabled = !enabled;
        $('stopChenillard').disabled = !enabled;
        $('sensChenillard').disabled = !enabled;
        $('speed25').disabled = !enabled;
        $('speed50').disabled = !enabled;
        $('speed75').disabled = !enabled;
        $('speed100').disabled = !enabled;

    },

    // Debug côté client
    log: function(type, message){
        console.log("["+type+"] "+message)
    },

    // A l'ouverture du websocket
    _onopen : function() {
        wstool.setState(true);
        wstool.log("info", "Websocket Connected");
    },

    // Communication client -> serveur
    _send : function(command, arg) {
        if (this._ws) {
            let message = JSON.stringify({"command":command, "arg":arg})
            this._ws.send(message);
            wstool.log("client", message);
        }
    },

    // Communication serveur -> client
_onmessage : function(m) {
        if (m.data) {
            wstool.log("server", m.data);
            var response = JSON.parse(m.data);
            var leds = ["led1","led2","led3","led4"]
            for(let i = 0; i < 4; i++){
                response[i] = response[i] ? "images/led_green.png" : "images/led_red.png"
                $(leds[i]).setAttribute("src",response[i])
            }
        }
    },

    // Fermeture du websocket
    _onclose : function(closeEvent) {
        this._ws = null;
        wstool.setState(false);
        wstool.log("info", "Websocket Closed");
        wstool.log("info", "  .wasClean = " + closeEvent.wasClean);

        var codeMap = {};
        codeMap[1000] = "(NORMAL)";
        codeMap[1001] = "(ENDPOINT_GOING_AWAY)";
        codeMap[1002] = "(PROTOCOL_ERROR)";
        codeMap[1003] = "(UNSUPPORTED_DATA)";
        codeMap[1004] = "(UNUSED/RESERVED)";
        codeMap[1005] = "(INTERNAL/NO_CODE_PRESENT)";
        codeMap[1006] = "(INTERNAL/ABNORMAL_CLOSE)";
        codeMap[1007] = "(BAD_DATA)";
        codeMap[1008] = "(POLICY_VIOLATION)";
        codeMap[1009] = "(MESSAGE_TOO_BIG)";
        codeMap[1010] = "(HANDSHAKE/EXT_FAILURE)";
        codeMap[1011] = "(SERVER/UNEXPECTED_CONDITION)";
        codeMap[1015] = "(INTERNAL/TLS_ERROR)";
        var codeStr = codeMap[closeEvent.code];
        wstool.log("info", "Code = " + closeEvent.code + "  " + codeStr);
        wstool.log("info", "Reason = " + closeEvent.reason);
    }
};