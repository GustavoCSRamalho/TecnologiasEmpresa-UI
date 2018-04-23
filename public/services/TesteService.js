angular.module("app").service("ChatService", function($q, $timeout) {

    var service = {}, listener = $q.defer(), socket = {
        client: null,
        stomp: null
    }, messageIds = [];

    service.RECONNECT_TIMEOUT = 30000;
    service.SOCKET_URL = "ws://localhost:8080/chat";
    service.CHAT_TOPIC = "/topic/message";
    service.CHAT_BROKER = "/app/chat";

    service.receive = function() {
        return listener.promise;
    };

    service.send = function(message) {
        var id = Math.floor(Math.random() * 1000000);
        socket.stomp.send(service.CHAT_BROKER, {
            priority: 9
        }, JSON.stringify({
            message: message,
            id: id
        }));
        messageIds.push(id);
    };

    var reconnect = function() {
        $timeout(function() {
            initialize();
        }, this.RECONNECT_TIMEOUT);
    };

    var getMessage = function(data) {
        var message = JSON.parse(data), out = {};
        out.message = message.message;
        out.time = new Date(message.time);
        // if (_.contains(messageIds, message.id)) {
        //     out.self = true;
        //     messageIds = _.remove(messageIds, message.id);
        // }
        out.self = true;
        return out;
    };

    var startListener = function() {
        socket.stomp.subscribe(service.CHAT_TOPIC, function(data) {
            listener.notify(getMessage(data.body));
        });

        socket.stomp.send(service.CHAT_BROKER,{},"Teste");
    };

    var initialize = function() {
        console.log("2");
        socket.client = new WebSocket(service.SOCKET_URL);
        socket.stomp = Stomp.over(socket.client);
        socket.stomp.connect({}, startListener);
        console.log("1");
        socket.stomp.onclose = reconnect;
    };

    initialize();
    return service;
});