// main game logic
let game = new Game();
let movement = new Movement();

const planes = document.querySelectorAll('.plane');

// make back arrow functional to reset moves
document.getElementById('back-arrow').addEventListener('click', function () {
   game.undoMove();
   this.classList.add('disabled');
   setTimeout(function() {
      document.getElementById('back-arrow').classList.remove('disabled');
   }, 520);
});

function updatePositions() {
   game.whitePieces.forEach(piece => {
      piece.classList.add('notransition');
      Movement.updatePosition(piece);
   });
   game.blackPieces.forEach(piece => {
      piece.classList.add('notransition');
      Movement.updatePosition(piece);
   });

   // remove the notransition classes
   document.querySelectorAll('.notransition').forEach(node => {
      node.classList.remove('notransition');
   });

}

// window.resize event listener
window.addEventListener('resize', function() {
   updatePositions();
});

