
console.log("adding controller event listener");
let gamePadIndex;
window.addEventListener("gamepadconnected", (e) => {
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length);
    gamePadIndex = e.gamepad.index;
    document.getElementById("StatusHeader").innerHTML = "Controller Connected!";
    gameLoop();
});

function gameLoop() {
  const gamepads = navigator.getGamepads();
  if (!gamepads) {
    return;
  }
  const gp = gamepads[gamePadIndex];
  console.log(gp.buttons);

  const directionValues = [];
  gp.buttons.forEach((button, index)=>{
    if (button.pressed) {
      console.log("Button " + index + "Pressed!");
      const id = getButtonMapID(index);
      if (id != null){
        document.getElementById(id).classList.add('button-indicator-pressed');
        document.getElementById(id).classList.remove('button-indicator');
      }

      const dir = getDirectionMap(index);
      if (dir != null){
        directionValues.push(dir);
      }

    }
    else {
      const id = getButtonMapID(index);
      if (id != null) {
        document.getElementById(id).classList.add('button-indicator');
        document.getElementById(id).classList.remove('button-indicator-pressed');
      }
    }
  });

  moveFromDirectionMapValues(directionValues);


  requestAnimationFrame(gameLoop);
}

function getButtonMapID(i){
  switch (i){
    case 0:
      return "x-button";
    case 1:
      return "circle-button";
    case 2:
      return "square-button";
    case 3:
      return "triangle-button";
    case 4:
      return "l1-button";
    case 5:
      return "r1-button";
    case 6:
      return "l2-button";
    case 7:
      return "r2-button";
    default:
      return null;
  }
}

function getDirectionMap(i){
  switch (i){
    case 12:
      return "up";
    case 13:
      return "down";
    case 14:
      return "left";
    case 15:
      return "right";
    default:
      return null;
  }
}
function moveFromDirectionMapValues(directionValues){
  console.log(directionValues);
  let leftPos = 45;
  let upPos = 45;

  for(let dir of directionValues) {
    if (dir === "up") {
      upPos -= 45;
    }
    if (dir === "down") {
      upPos += 45;
    }
    if (dir === "left") {
      leftPos -= 45;
    }
    if (dir === "right") {
      leftPos += 45;
    }
  }
    document.getElementById('dpad-indication').style.left = (leftPos) + 'px';
    document.getElementById('dpad-indication').style.top = (upPos) + 'px';
}
