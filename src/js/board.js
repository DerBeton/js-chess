class Plane extends HTMLElement {

    static alphabet = ["a", "b", "c", "d", "e", "f", "g", "h"];
    static numbers = [1, 2, 3, 4, 5, 6, 7, 8];

    constructor(position, color, spawn = true) {
        // call super from constructor
        super();

        if(spawn) {
            this.position = position;
            this.row = parseInt(position[1]);
            this.col = position[0];
            this.colCode = position[0].charCodeAt(0);
            this.color = color;
            this.piece = null; // no piece is on plane

            // set data-field, classes and id
            this.setAttribute('id', position);
            this.classList.add('plane', color);

            this.spawn();

            this.addEventListener('click', function(event) {
                addPlaneEventListener(this);
            });
        }
    }
    spawn() {
        document.getElementById('plane-row-' + this.position.charAt(1)).appendChild(this); // spawn plane in correct row
    }

}

window.customElements.define('b-plane', Plane);

function spawnPlanes() {

    const planes = new Map();

    for(let rowIndex = 8; rowIndex > 0; rowIndex--) {
        for(let i = 0; i < 8; i++) {
            if(i%2 == 0) {
                planes.set(Plane.alphabet[i]+rowIndex, new Plane(Plane.alphabet[i]+rowIndex, Color.Black));
            } else {
                planes.set(Plane.alphabet[i]+rowIndex, new Plane(Plane.alphabet[i]+rowIndex, Color.White));
            }
        }
    }

    game.planes = planes;
}

spawnPlanes();
function addPlaneEventListener(plane) {

    // check if piece is selected and then move if movement is allowed.
    if(game.currentPiece != null) {
        if (game.currentPiece.color === Color.White && (plane.piece == null || plane.piece.color === Color.Black)) {
            let moveToPiece = plane.piece;
            let moveDone = movement.movePiece(game.currentPiece, plane);
            if (moveToPiece != null && moveToPiece.color === Color.Black && moveDone) {
                moveToPiece.removePiece();
                let wrapper = document.createElement('div');
                wrapper.classList.add('gravestone');
                document.getElementById('grave-container-black').appendChild(wrapper);
                wrapper.appendChild(moveToPiece);
                game.blackPieces.splice(game.blackPieces.indexOf(moveToPiece), 1);
            }
        } else if (game.currentPiece.color === Color.Black && (plane.piece == null || plane.piece.color === Color.White)) {
            let moveToPiece = plane.piece;
            let moveDone = movement.movePiece(game.currentPiece, plane);
            if (moveToPiece != null && moveToPiece.color === Color.White && moveDone) {
                moveToPiece.removePiece();
                let wrapper = document.createElement('div');
                wrapper.classList.add('gravestone');
                document.getElementById('grave-container-white').appendChild(wrapper);
                wrapper.appendChild(moveToPiece);
                game.whitePieces.splice(game.whitePieces.indexOf(moveToPiece), 1);
            }
        }
    }

}