function getTranslateX(piece) {
    var style = window.getComputedStyle(piece);
    var matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m41;
}

function getTranslateY(piece) {
    var style = window.getComputedStyle(piece);
    var matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m42;
}

class Movement {
    constructor() {
    }

    static distanceBetweenX(currPosition, nextPosition) {
        const x1 = currPosition.offsetLeft;
        const x2 = nextPosition.offsetLeft;
        const xDistance = x2 - x1;
        return xDistance;
    }

    static distanceBetweenY(currPosition, nextPosition) {
        const y1 = currPosition.offsetTop;
        const y2 = nextPosition.offsetTop;
        const yDistance = y2 - y1;
        return yDistance;
    }

    static getTranslateX(piece) {
        var style = window.getComputedStyle(piece);
        var matrix = new WebKitCSSMatrix(style.transform);
        return matrix.m41;
    }

    static getTranslateY(piece) {
        var style = window.getComputedStyle(piece);
        var matrix = new WebKitCSSMatrix(style.transform);
        return matrix.m42;
    }

    /* updates position after window resize */
    static updatePosition(piece) {
        piece.style.transform = "translate(" + (Movement.distanceBetweenX(piece.initPosition, piece.position)) + "px," + (Movement.distanceBetweenY(piece.initPosition, piece.position)) + "px)";
    }

    movePiece(piece, plane, undoMove = false, rochade = false) {

        // let moveFrom = piece.position;
        // let moveFrom = game.planes.get(piece.position);
        let moveFrom = piece.position;
        // let moveFromElement = document.getElementById(moveFrom);
        let moveTo = plane;

        if(piece.moveAllowed(moveFrom, moveTo) || undoMove) {

            let ate = moveTo.piece;
            // piece.position = moveTo.id; // could also use the object itself: moveTo...
            piece.position = moveTo;
            moveFrom.piece = null;
            plane.piece = piece;

            if(piece.color === Color.Black && piece instanceof Pawn && moveTo.row === 1) {
                console.log('black pawn reached bottom');
                game.pawnReachedEnd = piece;
            }

            if(piece.color === Color.White && piece instanceof Pawn && moveTo.row === 8) {
                console.log('white pawn reached top');
                game.pawnReachedEnd = piece;
            }

            // only add to move list if its a real move and not undo action
            if(!undoMove) {
                game.addMove(piece, moveFrom, moveTo, rochade, ate, game.pawnReachedEnd); // moveFrom and plane is moveTo
                game.deselectPiece();
                if(!rochade) { // otherwise same color can play twice after rochade
                    game.changeTurn();
                }
            }

            piece.style.transform = "translate(" + (Movement.getTranslateX(piece) + Movement.distanceBetweenX(moveFrom, moveTo)) + "px," + (Movement.getTranslateY(piece) + Movement.distanceBetweenY(moveFrom, moveTo)) + "px)";

            moveFrom = null;
            moveTo = null;

            if(!undoMove) {

                if (game.blackKing.inCheck || piece.color === Color.Black) {
                    // wait until the eaten figure is in grave (technically)
                    setTimeout(function() {
                        if (game.checkBlackCheck(false)) {
                            console.log('illegal move, undo');
                            setTimeout(function () {
                                game.undoMove();
                            }, 550);
                        }
                    }, 50);
                }

                if (game.whiteKing.inCheck || piece.color === Color.White) {
                    // wait until the eaten figure is in grave (technically)
                    setTimeout(function() {
                        if (game.checkWhiteCheck(false)) {
                            console.log('illegal move, undo');
                            setTimeout(function () {
                                game.undoMove();
                            }, 550);
                        }
                    }, 50);
                }

            }

            return true;

        }

        return false;

    }

}