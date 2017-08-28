var Observable = function() {
    var _self = this;

    _self.data;
    _self.subscribers = [];

    _self.publish = function() {
        for (var i in _self.subscribers) {
            _self.subscribers[i]();
        }
    }

    _self.subscribe = function(callback) {
        _self.subscribers.push(callback);
    }

    _self.unsubscribe = function(callback) {
        for (var i in _self.subscribers) {
            if (_self.subscribers[i] == callback) {
                    _self.subscribers.splice(i, 1);
            }
        }
    }
    
    return Observable;
}
 
var gameView = {
    board: document.getElementById("game-table")
};

var gameModel = {
    gameField: new Observable(),
    currentCol: new Observable(),
    currentRow: new Observable(),
    currentPlayer: new Observable(),
    disc: new Observable(),
    moves_array: [],
    win: new Observable(),
    id: 1
};

var gameSetup = {
    prepareField: function() {
        gameModel.gameField = new Array();
        for (var i = 0; i < 6; i++)
        {
            gameModel.gameField[i] = new Array();
            for (var j = 0; j < 7; j++)
            {
                gameModel.gameField[i].push(0);
            }
        }
    }
};

var gameController = {
    placeDisc: function(player) {
        gameModel.currentPlayer = player;
        gameModel.disc = new gameController.playDisc(player);
        gameModel.disc.addToScene();
    },
    
    playDisc: function(player) {
        this.player = player;
        this.color = player == 1 ? 'red' : 'yellow';
        this.id = gameModel.id.toString();
        gameModel.id++;
    
        this.addToScene = function() {
            gameView.board.innerHTML += '<div id="d'+this.id+'" class="disc '+this.color+'"></div>';
        }
  
        var $this = this;
        document.onmousemove = function(evt) {

            gameModel.currentCol = Math.floor((evt.clientX - gameView.board.offsetLeft)/60);
            if (gameModel.currentCol < 0)
            {
                gameModel.currentCol = 0;
            }
            if (gameModel.currentCol > 6)
            {
                gameModel.currentCol = 6;
            }
        
            document.getElementById('d' + $this.id).style.left = (14 + 60 * gameModel.currentCol)+"px";
            document.getElementById('d' + $this.id).style.top = "-55px";
        }
  
        document.onclick = function(evt) {
            gameController.dropDisc($this.id, $this.player);
        }
    },
    
    dropDisc: function (cid, player) {
        gameModel.currentRow = gameController.firstFreeRow(gameModel.currentCol, player);
        gameController.moveit(cid, (14 + gameModel.currentRow * 60));
        gameModel.currentPlayer = player;
        gameController.checkForMoveVictory();
    },
    
    moveit: function (who, where) {
        document.getElementById('d' + who).style.top = where + 'px';
    },
    
    checkForVictory: function(row, col) {
        if (gameController.getAdj(row, col, 0, 1) + gameController.getAdj(row, col, 0, -1) > 2)
        {
            return true;
        }
        else 
        {
            if (gameController.getAdj(row, col, 1, 0) > 2)
            {
                return true;
            }
            else
            {
                if (gameController.getAdj(row, col, -1, 1) + gameController.getAdj(row, col, 1, -1) > 2)
                {
                    return true;
                }
                else
                {
                    if (gameController.getAdj(row, col, 1, 1) + gameController.getAdj(row, col, -1, -1) > 2)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
    },
    
    getAdj: function(row, col, row_inc, col_inc) {
        if (gameController.cellVal(row, col) == gameController.cellVal(row+row_inc, col+col_inc))
        {
            return 1 + gameController.getAdj(row+row_inc, col+col_inc, row_inc, col_inc);
        }
        else
        {
            return 0;
        }
    },

    cellVal: function(row, col) {
        if (gameModel.gameField[row] == undefined || gameModel.gameField[row][col] == undefined)
        {
            return -1;
        }
        else
        {
            return gameModel.gameField[row][col];
        }
    },

    firstFreeRow: function(col, player) {
        for (var i = 0; i < 6; i++)
        {
            if(gameModel.gameField[i][col] != 0)
            {
                break;
            }
        }

        gameModel.gameField[i - 1][col] = player;
        return i - 1;
    },

    possibleColumns: function() {
        for(var i = 0; i < 7; i++)
        {
            if (gameModel.gameField[0][i] == 0)
            {
                gameModel.moves_array.push(i);
            }
        }
        return gameModel.moves_array;
    },

    checkForMoveVictory: function() {
        if (!gameController.checkForVictory(gameModel.currentRow, gameModel.currentCol))
        {
            gameController.placeDisc(3 - gameModel.currentPlayer);
        }
        else
        {
            gameModel.win = gameModel.currentPlayer == 2 ? 'Yellow' : 'Red';
            gameController.placeDisc(3 - gameModel.currentPlayer);
            alert(gameModel.win + " wins!");
            gameView.board.innerHTML = "";
            location.reload();
        }
    }
};

function newGame() {
    gameSetup.prepareField();
    gameController.placeDisc(Math.floor(Math.random()*2)+1);
}

newGame();