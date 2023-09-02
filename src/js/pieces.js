class Piece extends HTMLElement {

    static alphabet = ["a", "b", "c", "d", "e", "f", "g", "h"];
    static numbers = [1, 2, 3, 4, 5, 6, 7, 8];

    constructor(position, color, spawn = true, note = '') {
        // call super from constructor
        super();

        if (spawn) {
            this.initPosition = (game.planes.get(position) != null ? game.planes.get(position) : position);
            this.position = (game.planes.get(position) != null ? game.planes.get(position) : position);
            this.color = color;
            this.moveCount = 0; // to track if piece has been move in game
            this.inGrave = false; // if element is in grave (eaten)
            this.note = note;
            this.changed = false; // true if player reached end and changed piece with another one

            // set data-field, classes and id
            this.setAttribute('data-field', position);
            this.setAttribute('id', this.constructor.name.toLowerCase() + '-' + position);
            this.classList.add('piece', this.constructor.name.toLowerCase(), color);

            this.spawn();

            this.addEventListener('click', function (event) {

                if (this.note == 'spawn') {
                    this.spawnNew(this.nodeName);
                }

                let isActive = false;
                if (this.classList.contains('active')) {
                    isActive = true;
                }

                if(this.inGrave == true) {
                    return;
                }

                game.deselectPiece();

                if (game.currentColor === Color.Black && this.classList.contains('black')) {
                    // deselectPiece();
                    if (!isActive) {
                        this.classList.add('active');
                        game.currentPiece = this;
                    }
                    // "Event Bubbling" stop from checking more click events
                    event.stopPropagation();
                }

                if (game.currentColor === Color.White && this.classList.contains('white')) {
                    // deselectPiece();
                    if (!isActive) {
                        this.classList.add('active');
                        game.currentPiece = this;
                    }
                    // "Event Bubbling" stop from checking more click events
                    event.stopPropagation();
                }

            });

        }
    }

    spawn() {

        if(this.position instanceof Plane) {
            this.position.appendChild(this);
            this.position.piece = this;
        } else {
            document.getElementById(this.position).appendChild(this);
        }

        /*
        if(game.planes.get(this.position) !== undefined) {
            game.planes.get(this.position).appendChild(this);
            game.planes.get(this.position).piece = this;
        }

         */


        /*
        document.getElementById(this.position).appendChild(this);
        if (game.planes.get(this.position) !== undefined) {
            game.planes.get(this.position).piece = this; // add piece to plane piece
        }

         */
    }

    moveAllowed() {
        return true;
    }

    spawnNew(type) {
        let newPiece;

        switch (type) {
            case "P-TOWER":
                newPiece = new Tower(game.pawnReachedEnd.position.id, game.pawnReachedEnd.color, true, 'summon');
                break;
            case "P-KNIGHT":
                newPiece = new Knight(game.pawnReachedEnd.position.id, game.pawnReachedEnd.color, true, 'summon');
                break;
            case "P-BISHOP":
                newPiece = new Bishop(game.pawnReachedEnd.position.id, game.pawnReachedEnd.color, true, 'summon');
                break;
            case "P-QUEEN":
                newPiece = new Queen(game.pawnReachedEnd.position.id, game.pawnReachedEnd.color, true, 'summon');
                break;
        }

        if (game.pawnReachedEnd.color === Color.White) {
            game.whitePieces.push(newPiece);
        } else if (game.pawnReachedEnd.color === Color.Black) {
            game.blackPieces.push(newPiece);
        }

        // remove before setting position of new piece
        game.removePawnEnd();

        newPiece.position.piece = newPiece;
        // game.planes.get(newPiece.position).piece = newPiece;

        game.spawnSelectionHide(newPiece.color);
        game.changeTurn()
    }

    removePiece(swap = false, completeRemove = false) {
        this.inGrave = true;
        // game.planes.get(this.position).piece = null;

        if (swap) {
            this.changed = true;
            this.style.zIndex = "-100";
        }

        if(completeRemove) {
            game.getPiecesByColor(this.color).pop(); // remove summoned element from pieces
            this.remove(); // removes complete html element
        }
    }

    // used if piece is in Grave and undoMove is called
    revivePiece() {
        this.inGrave = false;
        if(this.color === Color.Black) {
            game.blackPieces.push(this);
        } else if(this.color === Color.White) {
            game.whitePieces.push(this);
        }

        game.makeUnclickable(this);

        this.parentElement.remove();

        this.position.piece = this;
        this.initPosition.appendChild(this);

        // game.planes.get(this.position).piece = this;
        // game.planes.get(this.initPosition).appendChild(this);
    }

    // use if want to revive piece which was swaped while pawn reached end
    reviveFromSwap() {
        this.position.piece = this;
        // game.planes.get(this.position).piece = this;
        this.style.zIndex = "1";
    }

}

class Pawn extends Piece {
    constructor(position, color, spawn, note) {
        super(position, color, spawn, note);
    }


    moveAllowed(moveFrom, moveTo) {
        const startRow = moveFrom.row;
        const startFile = moveFrom.col;
        const endRow = moveTo.row;
        const endFile = moveTo.col;

        let pieceAtMoveTo = (moveTo.piece != null ? true : false);

        if(this.color === Color.White) {
            // pawn is at starting position and moves two steps to the front
            if(startRow === 2 && endRow === 4 && startFile === endFile && game.planes.get(startFile + (startRow + 1)).piece == null) {
                return !pieceAtMoveTo; // if there is a piece, move not allowed!
            } else if(endRow === startRow + 1 && startFile === endFile) {
                return !pieceAtMoveTo; // if there is a piece, move not allowed!
            } else if(endRow === startRow + 1 && (endFile.charCodeAt(0) === startFile.charCodeAt(0) + 1 || endFile.charCodeAt(0) === startFile.charCodeAt(0) - 1)) {
                return pieceAtMoveTo; // only allowed if there is a piece
            }
            return false;
        }

        if(this.color === Color.Black) {
            // pawn is at starting position and moves two steps to the front
            if(startRow === 7 && endRow === 5 && startFile === endFile && game.planes.get(startFile + (startRow - 1)).piece == null) {
                return !pieceAtMoveTo; // if there is a piece, move not allowed!
            } else if(endRow === startRow - 1 && startFile === endFile) {
                return !pieceAtMoveTo; // if there is a piece, move not allowed!
            } else if(endRow === startRow - 1 && (endFile.charCodeAt(0) === startFile.charCodeAt(0) + 1 || endFile.charCodeAt(0) === startFile.charCodeAt(0) - 1)) {
                return pieceAtMoveTo; // only allowed if there is a piece
            }
            return false;
        }

    }

}

window.customElements.define('p-pawn', Pawn);

class Tower extends Piece {
    constructor(position, color, spawn, note) {
        super(position, color, spawn, note);
    }

    checkRankTopBottom(fileCode, startRank, endRank, opponentColor) {
        for (let i = startRank - 1; i >= endRank; i--) {

            let currentPlane = game.planes.get(String.fromCharCode(fileCode) + i);

            if (currentPlane.piece != null) {
                if (currentPlane === game.planes.get(String.fromCharCode(fileCode) + endRank) && currentPlane.piece.color === opponentColor) {
                    break;
                }
                return false;
            }

        }
        return true;
    }

    checkRankBottomTop(fileCode, startRank, endRank, opponentColor) {

        for (let i = startRank + 1; i <= endRank; i++) {

            let currentPlane = game.planes.get(String.fromCharCode(fileCode) + i);

            if (currentPlane.piece != null) {
                if (currentPlane === game.planes.get(String.fromCharCode(fileCode) + endRank) && currentPlane.piece.color === opponentColor) {
                    break;
                }
                return false;
            }

        }
        return true;
    }

    checkFileLeftRight(row, startFileCode, endFileCode, opponentColor) {

        for (let i = startFileCode + 1; i <= endFileCode; i++) {
            let currentPlane = game.planes.get(String.fromCharCode(i) + row);

            if (currentPlane.piece != null) {
                // if piece at the end is opponent, move allowed.
                if (currentPlane === game.planes.get(String.fromCharCode(endFileCode) + row) && currentPlane.piece.color === opponentColor) {
                    break;
                }
                return false;
            }

        }

        return true;
    }

    checkFileRightLeft(row, startFileCode, endFileCode, opponentColor) {

        for (let i = startFileCode - 1; i >= endFileCode; i--) {
            let currentPlane = game.planes.get(String.fromCharCode(i) + row);

            if (currentPlane.piece != null) {
                // if piece at the end is opponent, move allowed.
                if (currentPlane === game.planes.get(String.fromCharCode(endFileCode) + row) && currentPlane.piece.color === opponentColor) {
                    break;
                }
                return false;
            }

        }

        return true;
    }

    moveAllowed(moveFrom, moveTo) {
        const startRow = moveFrom.row;
        const startFile = moveFrom.col;
        const startFileCode = moveFrom.colCode;
        const endRow = moveTo.row;
        const endFile = moveTo.col;
        const endFileCode = moveTo.colCode;

        if (startFileCode === endFileCode) {
            if (startRow < endRow) {
                return this.checkRankBottomTop(startFileCode, startRow, endRow, (this.color === Color.Black ? Color.White : Color.Black));
            } else if (startRow > endRow) {
                return this.checkRankTopBottom(startFileCode, startRow, endRow, (this.color === Color.Black ? Color.White : Color.Black));
            }
        }

        if (startRow === endRow) {

            if (startFileCode > endFileCode) {
                return this.checkFileRightLeft(startRow, startFileCode, endFileCode, (this.color === Color.Black ? Color.White : Color.Black));
            } else if (startFileCode < endFileCode) {
                return this.checkFileLeftRight(startRow, startFileCode, endFileCode, (this.color === Color.Black ? Color.White : Color.Black));
            }

        }

        return false;

    }

}

window.customElements.define('p-tower', Tower);

class Bishop extends Piece {
    constructor(position, color, spawn, note) {
        super(position, color, spawn, note);
    }

    moveAllowed(moveFrom, moveTo) {
        const startRow = moveFrom.row;
        const startFile = moveFrom.col;
        const startFileCode = moveFrom.colCode;
        const endRow = moveTo.row;
        const endFile = moveTo.col;
        const endFileCode = moveTo.colCode;

        let direction;

        if (startFileCode < endFileCode) {
            if (startRow < endRow) {
                direction = 'top-right';
            } else {
                direction = 'bottom-right';
            }
        } else {
            if (startRow < endRow) {
                direction = 'top-left';
            } else {
                direction = 'bottom-left';
            }
        }

        const rowDiff = Math.abs(startRow - endRow);
        const fileDiff = Math.abs(startFileCode - endFileCode);

        if (rowDiff === fileDiff) {

            for (let i = 1; i <= rowDiff; i++) {

                let currRow;
                let currFile;

                switch (direction) {
                    case 'bottom-right':
                        currRow = startRow - i;
                        currFile = String.fromCharCode(startFileCode + i);
                        break;
                    case 'top-right':
                        currRow = startRow + i;
                        currFile = String.fromCharCode(startFileCode + i);
                        break;
                    case 'bottom-left':
                        currRow = startRow - i;
                        currFile = String.fromCharCode(startFileCode - i);
                        break;
                    case 'top-left':
                        currRow = startRow + i;
                        currFile = String.fromCharCode(startFileCode - i);
                        break;
                    default:
                        return false;
                }

                let currentPlane = game.planes.get(currFile + currRow);

                if (currentPlane.piece != null) {

                    if (currentPlane == moveTo && currentPlane.piece.color === (this.color === Color.Black ? Color.White : Color.Black)) {
                        break;
                    }
                    return false;
                }

            }

            return true;
        }

        return false;
    }

}

window.customElements.define('p-bishop', Bishop);

class Knight extends Piece {
    constructor(position, color, spawn, note) {
        super(position, color, spawn, note);
    }

    moveAllowed(moveFrom, moveTo) {
        const startRow = moveFrom.row;
        const startFile = moveFrom.col;
        const startFileCode = moveFrom.colCode;
        const endRow = moveTo.row;
        const endFile = moveTo.col;
        const endFileCode = moveTo.colCode;

        const rowDiff = Math.abs(startRow - endRow);
        const fileDiff = Math.abs(startFileCode - endFileCode);

        if (rowDiff === 2 && fileDiff === 1 || rowDiff === 1 && fileDiff === 2) {
            return true;
        }

        return false;
    }
}

window.customElements.define('p-knight', Knight);

class Queen extends Piece {
    constructor(position, color, spawn, note) {
        super(position, color, spawn, note);
        // this objects are only here to access moveAllowed() method
        this.bishop = new Bishop(1, "white", false);
        this.tower = new Tower(2, "white", false);
    }

    moveAllowed(moveFrom, moveTo) {
        this.bishop.position = moveFrom;
        this.tower.position = moveFrom;

        this.bishop.color = (this.color === Color.Black ? Color.Black : Color.White);
        this.tower.color = (this.color === Color.Black ? Color.Black : Color.White);

        return (this.bishop.moveAllowed(moveFrom, moveTo) || this.tower.moveAllowed(moveFrom, moveTo));
    }

}

window.customElements.define('p-queen', Queen);

class King extends Piece {
    constructor(position, color, spawn, note) {
        super(position, color, spawn, note);

        if(color === Color.Black) { game.blackKing = this };
        if(color === Color.White) { game.whiteKing = this };

        // this is true if King is in check
        this.inCheck = false;

    }

    moveAllowed(moveFrom, moveTo) {
        const startRow = moveFrom.row;
        const startFile = moveFrom.col;
        const startFileCode = moveFrom.colCode;
        const endRow = moveTo.row;
        const endFile = moveTo.col;
        const endFileCode = moveTo.colCode;

        const rowDiff = Math.abs(startRow - endRow);
        const fileDiff = Math.abs(startFileCode - endFileCode);

        if (rowDiff <= 1 && fileDiff <= 1) {
            return true;
        }

        // castling/rochade white
        if (!this.moveCount > 0 && this.color === Color.White && (moveTo == game.planes.get('g1') || moveTo == game.planes.get('c1'))) {
            let tower;
            let kingTo;
            let towerTo;

            if (moveTo == game.planes.get('g1')) {
                tower = document.getElementById('tower-h1');
                kingTo = game.planes.get('g1');
                towerTo = game.planes.get('f1');
            } else {
                tower = document.getElementById('tower-a1');
                kingTo = game.planes.get('c1');
                towerTo = game.planes.get('d1');
            }

            if (kingTo.piece == null && towerTo.piece == null && !tower.moveCount > 0) {
                movement.movePiece(tower, towerTo, false, true);
                return true;
            }

        }

        // castling/rochade black
        if (!this.moveCount > 0 && this.color === Color.Black && moveTo == game.planes.get('g8') || moveTo == game.planes.get('c8')) {
            let tower;
            let kingTo;
            let towerTo;

            if (moveTo == game.planes.get('g8')) {
                tower = document.getElementById('tower-h8');
                kingTo = game.planes.get('g8');
                towerTo = game.planes.get('f8');
            } else {
                tower = document.getElementById('tower-a8');
                kingTo = game.planes.get('c8');
                towerTo = game.planes.get('d8');
            }

            if (kingTo.piece == null && towerTo.piece == null && !tower.moveCount > 0) {
                movement.movePiece(tower, towerTo, false, true);
                return true;
            }

        }

        return false;
    }

}

window.customElements.define('p-king', King);

function spawnPieces(color) {

    let pieces = [];
    let firstRow;
    let secondRow;

    if(color === Color.White) {
        firstRow = '2';
        secondRow = '1';
    } else {
        firstRow = '7';
        secondRow = '8';
    }

    for (let i = 0; i < 8; i++) {
        pieces.push(new Pawn(Plane.alphabet[i] + firstRow, color));
    }

    for (let j = 0; j < 8; j++) {

        switch (Plane.alphabet[j]) {
            case "a":
            case "h":
                pieces.push(new Tower(Plane.alphabet[j] + secondRow, color));
                break;
            case "b":
            case "g":
                pieces.push(new Knight(Plane.alphabet[j] + secondRow, color));
                break;
            case "c":
            case "f":
                pieces.push(new Bishop(Plane.alphabet[j] + secondRow, color));
                break;
            case "d":
                pieces.push(new Queen(Plane.alphabet[j] + secondRow, color));
                break;
            case "e":
                pieces.push(new King(Plane.alphabet[j] + secondRow, color));
                break;
        }

    }

    game.getPiecesByColor(color).push(...pieces);
}

function spawnSelectionPieces(container, color) {
    let pieces = [];
    let selectionStart = '';

    if (color === Color.White) {
        selectionStart = 's-w-';
    } else if (color === Color.Black) {
        selectionStart = 's-b-';
    }

    pieces.push(new Tower(selectionStart + 'tower', color, true, 'spawn'));
    pieces.push(new Knight(selectionStart + 'knight', color, true, 'spawn'));
    pieces.push(new Bishop(selectionStart + 'bishop', color, true, 'spawn'));
    pieces.push(new Queen(selectionStart + 'queen', color, true, 'spawn'));

    if (color === Color.White) {
        game.selectionPiecesWhite = pieces;
    } else if (color === Color.Black) {
        game.selectionPiecesBlack = pieces;
    }

}

spawnPieces(Color.White);
spawnPieces(Color.Black);

spawnSelectionPieces('spawn-container-white', Color.White); // Pieces to select when pawn reaches end
spawnSelectionPieces('spawn-container-black', Color.Black); // Pieces to select when pawn reaches end