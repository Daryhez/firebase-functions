const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

exports.createGame = functions.https.onRequest(async (request, response) => {
    const name = request.query.name;
    inList = false;
    await admin.database().ref('/games').once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            inList = inList || childSnapshot.val()['name'] == name;
        });
    })
    if (inList){
        response.send(name + " already exist!");
    } else {
        await admin.database().ref('/games').push({
            name: name,
            available: true
        });
        response.send(name + " created!");
    }
});

exports.showGames = functions.https.onRequest(async (request, response) => {
    onlineGames = []
    const data = await admin.database().ref('/games').once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var childData = childSnapshot.val();
            onlineGames.push(childData)
        });
    })
    response.send(onlineGames);
});

exports.joinGame = functions.https.onRequest(async (request, response) => {
    const name = request.query.name;
    var inList = false;
    var keyGame;
    var valueGame;
    await admin.database().ref('/games').once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            inList = inList || childSnapshot.val()['name'] == name;
            if (inList){
                keyGame = childSnapshot.key;
                valueGame = childSnapshot.val();
            }
        });
    })
    if (inList) {
        if (valueGame.available) {
            updates = {}
            valueGame.available = false;
            valueGame.turn = 'O';
            valueGame.board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
            updates['/games/' + keyGame] = valueGame;
            admin.database().ref().update(updates);
            response.send('Joined to ' + name);
        } else {
            response.send(name + ' is full!');
        }
    } else {
        response.send(name + ' does not exist!');
    }
});

exports.deleteGame = functions.https.onRequest(async (request, response) => {
    const name = request.query.name;
    var inList = false;
    var keyGame;
    await admin.database().ref('/games').once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            inList = inList || childSnapshot.val()['name'] == name;
            if (inList) keyGame = childSnapshot.key;
        });
    })
    if (inList) {
        admin.database().ref('/games/' + keyGame).remove();
        response.send(name + ' deleted!');
    } else {
        response.send(name + ' does not exist!');
    }
});

exports.playGame = functions.https.onRequest(async (request, response) => {
    const name = request.query.name;
    const move = parseInt(request.query.move);
    const player = request.query.player;
    var inList = false;
    var keyGame;
    var valueGame;
    await admin.database().ref('/games').once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            inList = inList || childSnapshot.val()['name'] == name;
            if (inList) {
                keyGame = childSnapshot.key;
                valueGame = childSnapshot.val();
            }
        });
    })
    if (inList) {
        if (valueGame.turn == player){
            if (valueGame.board[move] == ' ') {
                valueGame.board[move] = player;
                if (player == 'X') valueGame.turn = 'O';
                else valueGame.turn = 'X';
                updates = {}
                updates['/games/' + keyGame] = valueGame;
                admin.database().ref().update(updates);
                response.send('Moved!');
            } else {
                response.send('Move not allowed here!');
            }
        }else{
            response.send('Is not your turn!');
        }
    } else {
        response.send(name + ' does not exist!');
    }
});