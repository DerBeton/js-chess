const Color = {
    Black: "black",
    White: "white"
}

class Game {
    constructor(props) {
        this.moveCount = 0;
        this.multiplayer = false;
        this.winner = null;
        this.moves = [];
        this.currentColor = Color.White;
        this.currentPiece = null;
        this.whitePieces = [];
        this.blackPieces = [];
        this.pawnReachedEnd = null; // pawn reached opposite of board -> select piece from grave
        this.selectionPiecesWhite = [];
        this.selectionPiecesBlack = [];
        this.whiteKing = null;
        this.blackKing = null;
        this.spawnPiece = null; // piece which player wants to spawn if pawnReachedEnd
        this.planes = new Map();
    }

    getPiecesByColor(color) {
        if(color === Color.White) {
            return game.whitePieces;
        } else if(color === Color.Black) {
            return game.blackPieces;
        }
        return null;
    }

    // ate is the piece which was eaten
    addMove(piece, from, to, rochade, ate, swap) {
        let obj = {
            piece: piece,
            from: from,
            to: to,
            rochade: rochade,
            ate: ate,
            swap: swap
        }

        // send moves to server if multiplayer is activated
        if(this.multiplayer) {
            this.sendMove(piece, from, to, rochade);
        }

        piece.moveCount++;
        this.moves.push(obj);
        this.moveCount++;

    }
    sendMove(piece, from, to, rochade, swap) {

        let obj = {
            piece: piece.id,
            from: from,
            to: to,
            rochade: rochade,
            swap: swap,
        }

        fetch('http://localhost:8080/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('Fehler beim Senden der POST-Anfrage:', error);
            });
    }

    // checks if white king is in check
    checkWhiteCheck(setInCheck) {
        for(let i = 0; i < game.blackPieces.length; i++) {
            let piece = game.blackPieces[i];
            // checks if piece is able to eat king
            if(piece.moveAllowed(piece.position, game.whiteKing.position)) {
                console.log(piece, 'check! white');
                if(setInCheck) {
                    game.whiteKing.inCheck = true;
                }
                return true;
            }
        }

        if(setInCheck) {
            game.whiteKing.inCheck = false;
        }
        return false;
    }

    // checks if black king is in check
    checkBlackCheck(setInCheck) {
        for(let i = 0; i < game.whitePieces.length; i++) {
            let piece = game.whitePieces[i];
            // checks if piece is able to eat king
            if(piece.moveAllowed(piece.position, game.blackKing.position)) {
                console.log(piece, 'check! black');
                if(setInCheck) {
                    game.blackKing.inCheck = true;
                }
                return true;
            }
        }
        if(setInCheck) {
            game.blackKing.inCheck = false;
        }
        return false;
    }

    undoMove() {
        let obj = this.moves.pop();

        if(obj != null) {

            // revive if piece was eaten
            if(obj.ate != null) {
                setTimeout(function() {
                    obj.ate.revivePiece();
                }, 400);
            }

            if(obj.swap != null) {
                obj.to.piece.removePiece(false, true);
                obj.piece.reviveFromSwap();
            }

            movement.movePiece(obj.piece, obj.from, true);

            obj.piece.moveCount--;
            this.changeTurn();
            // undo both movements
            if(this.moves.length > 1 && this.moves[this.moves.length-1].rochade) {
                this.undoMove();
                this.changeTurn();
            }

        }

    }

    /* toggle between black and white turn */
    changeTurn() {

        game.deselectPiece();

        // if pawn reached an of board, give him a selection of pieces to spawn
        if(game.pawnReachedEnd !== null) {
            this.spawnSelectionVisible(this.pawnReachedEnd.color);

            this.makeUnclickable(this.blackPieces);
            this.makeUnclickable(this.whitePieces);

            if(this.pawnReachedEnd.color === Color.White) {
                this.makeClickable(this.selectionPiecesWhite);
            } else if (this.pawnReachedEnd.color === Color.Black) {
                this.makeClickable(this.selectionPiecesBlack);
            }

            return;
        }

        if (this.currentColor === Color.Black) {
            this.currentColor = Color.White;

            // make black pieces unclickable
            this.makeUnclickable(this.blackPieces);

            // make white pieces clickable
            this.makeClickable(this.whitePieces);

        } else {

            this.currentColor = Color.Black;

            // make white pieces unclickable
            this.makeUnclickable(this.whitePieces);

            // make black pieces clickable
            this.makeClickable(this.blackPieces);
        }

    }

    spawnSelectionVisible(color) {
        if(color === Color.White) {
            document.getElementById('spawn-container-white').classList.add('visible');
        } else if(color === Color.Black) {
            document.getElementById('spawn-container-black').classList.add('visible');
        }
    }

    spawnSelectionHide(color) {
        if(color === Color.White) {
            document.getElementById('spawn-container-white').classList.remove('visible');
        } else if(color === Color.Black) {
            document.getElementById('spawn-container-black').classList.remove('visible');
        }
    }

    removePawnEnd() {
        game.pawnReachedEnd.removePiece(true);
        game.pawnReachedEnd = null;
    }

    makeUnclickable(pieces) {

        if(Array.isArray(pieces)) {
            pieces.forEach(piece => {
                piece.style.pointerEvents = 'none';
            });
        } else {
            pieces.style.pointerEvents = 'none';
        }

    }

    makeClickable(pieces) {

        if(Array.isArray(pieces)) {
            pieces.forEach(piece => {
                piece.style.pointerEvents = 'all';
            });
        } else {
            pieces.style.pointerEvents = 'all';
        }
    }

    deselectPiece() {
        this.currentPiece = null;
        this.blackPieces.forEach(piece => {
            piece.classList.remove('active');
        })
        this.whitePieces.forEach(piece => {
            piece.classList.remove('active');
        })
    }

}