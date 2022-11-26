
console.log("adding controller event listener");
let gamePadIndex;
let leftChargeTime = 0;
let rightChargeTime = 0;
let downChargeTime = 0;

let leftChargeWindowLock = false;
let rightChargeWindowLock = false;
let downChargeWindowLock  =false;

let moveRecoveryLock = false;

const FRAME_TO_MS_CONST = 16.66666666;
const CHARGE_BUFFER_FRAMES = 30;
const CHARGE_TRAVEL_FRAMES = 12;
const S_HORIZ_DOLPHIN_RECOVERY = 32;
const HS_HORIZ_DOLPHIN_RECOVERY = 32;
const S_VERT_DOLPHIN_RECOVERY =32;
const HS_VERT_DOLPHIN_RECOVERY = 32;

let buttonHeldMap = {};
let prevButtonHeldMap ={};
let buttonPressedMap = {};

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
  const directionValues = [];
  clearInputMap();

  gp.buttons.forEach((button, index)=>{
    if (button.pressed) {
      //console.log("Button " + index + "Pressed!");
      const id = getButtonMapID(index, true);
      if (id != null){
        document.getElementById(id).classList.add('button-indicator-pressed');
        document.getElementById(id).classList.remove('button-indicator');
      }

      const dir = getDirectionMap(index);

    }
    else {
      const id = getButtonMapID(index, false);
      if (id != null) {
        document.getElementById(id).classList.add('button-indicator');
        document.getElementById(id).classList.remove('button-indicator-pressed');
      }
    }
  });

  moveFromDirectionMapValues(directionValues);
  checkChargeMove();

  prevButtonHeldMap = Object.assign({}, buttonHeldMap);
  requestAnimationFrame(gameLoop);
}

function getButtonMapID(i, pressed){
  switch (i){
    case 0:
      buttonHeldMap.x = pressed;
      if (prevButtonHeldMap.x === false && pressed === true) {buttonPressedMap.x = true;}
      return "x-button";
    case 1:
      buttonHeldMap.circle = pressed;
      if (prevButtonHeldMap.circle === false && pressed === true) {buttonPressedMap.circle = true;}
      return "circle-button";
    case 2:
      buttonHeldMap.square = pressed;
      if (prevButtonHeldMap.square === false && pressed === true) {buttonPressedMap.square = true;}
      return "square-button";
    case 3:
      buttonHeldMap.triangle = pressed;
      if (prevButtonHeldMap.triangle === false && pressed === true) {buttonPressedMap.triangle = true;}
      return "triangle-button";
    case 4:
      buttonHeldMap.l1 = pressed;
      if (prevButtonHeldMap.l1 === false && pressed === true) {buttonPressedMap.l1 = true;}
      return "l1-button";
    case 5:
      buttonHeldMap.r1 = pressed;
      if (prevButtonHeldMap.r1 === false && pressed === true) {buttonPressedMap.r1 = true;}
      return "r1-button";
    case 6:
      buttonHeldMap.l2 = pressed;
      if (prevButtonHeldMap.l2 === false && pressed === true) {buttonPressedMap.l2 = true;}
      return "l2-button";
    case 7:
      buttonHeldMap.r2 = pressed;
      if (prevButtonHeldMap.r2 === false && pressed === true) {buttonPressedMap.r2 = true;}
      return "r2-button";
    default:
      return null;
  }
}

function getDirectionMap(i){
  switch (i){
    case 12:
      buttonHeldMap.up = true;
      return "up";
    case 13:
      buttonHeldMap.down = true;
      return "down";
    case 14:
      buttonHeldMap.left = true;
      return "left";
    case 15:
      buttonHeldMap.right = true;
      return "right";
    default:
      return null;
  }
}
function moveFromDirectionMapValues(directionValues){
  let leftPos = 45;
  let upPos = 45;

  let leftCharge = false;
  let rightCharge = false;
  let downCharge = false;

    if (buttonHeldMap.up === true) {
      upPos -= 45;
    }
    if (buttonHeldMap.down === true) {
      upPos += 45;
      downCharge = true;
    }
    if (buttonHeldMap.left === true) {
      leftPos -= 45;
    }
    if (buttonHeldMap.right === true) {
      leftPos += 45;
    }

    //SOCD cleaning, up is "absolute"
    if (leftCharge && rightCharge){
      buttonHeldMap.left = false;
      buttonHeldMap.right = false;
    }

    if (buttonHeldMap.left === true){
      if( leftChargeTime === 0){
        leftChargeTime = Date.now();
        console.log(leftChargeTime);
      }
      if (Date.now() - leftChargeTime > CHARGE_BUFFER_FRAMES * FRAME_TO_MS_CONST){
        console.log("left Charge buffered!");
      }
    }
    else {
      if (leftChargeTime !==0 &&
        Date.now() - leftChargeTime > CHARGE_BUFFER_FRAMES * FRAME_TO_MS_CONST &&
        leftChargeWindowLock === false){
        leftChargeWindowLock =true;
          setTimeout( ()=>{
            leftChargeWindowLock = false;
            leftChargeTime = 0;
            console.log("Travel Window ended");
          },FRAME_TO_MS_CONST * CHARGE_TRAVEL_FRAMES);
      }
      else {
        if (!leftChargeWindowLock){
          leftChargeTime = 0;
        }
      }
    }
    if (buttonHeldMap.right === true){
      if( rightChargeTime === 0){
        rightChargeTime = Date.now();
        console.log(rightChargeTime);
      }
      if (Date.now() - rightChargeTime > CHARGE_BUFFER_FRAMES * FRAME_TO_MS_CONST){
        console.log("right Charge buffered!");
      }
    }
    else {
      if (rightChargeTime !==0 &&  Date.now() - rightChargeTime > CHARGE_BUFFER_FRAMES * FRAME_TO_MS_CONST){
        rightChargeWindowLock = true;
        setTimeout( ()=>{
          rightChargeWindowLock = false;
          rightChargeTime = 0;
          console.log("Travel Window ended");
        },FRAME_TO_MS_CONST * CHARGE_TRAVEL_FRAMES);
      }
      else {
        if (!rightChargeWindowLock) {
          rightChargeTime = 0;
        }
      }
    }

    if (buttonHeldMap.down === true){
      if( downChargeTime === 0){
        downChargeTime = Date.now();
        console.log(downChargeTime);
      }
      if (Date.now() - downChargeTime > CHARGE_BUFFER_FRAMES * FRAME_TO_MS_CONST){
        console.log("down Charge buffered!");
      }
    }
    else {
      if (downChargeTime !==0 &&  Date.now() - downChargeTime > CHARGE_BUFFER_FRAMES * FRAME_TO_MS_CONST){
        downChargeWindowLock = true;
        setTimeout( ()=>{
          downChargeWindowLock = false;
          downChargeTime = 0;
          console.log("Travel Window ended");
        },FRAME_TO_MS_CONST * CHARGE_TRAVEL_FRAMES);
      }
      else {
        if (!downChargeWindowLock) {
          downChargeTime = 0;
        }
      }
    }

    document.getElementById('dpad-indication').style.left = (leftPos) + 'px';
    document.getElementById('dpad-indication').style.top = (upPos) + 'px';
}

function checkChargeMove() {
  if (leftChargeTime !== 0 &&
    leftChargeWindowLock &&
    buttonHeldMap.right === true &&
    moveRecoveryLock === false &&
    (buttonPressedMap.triangle === true || buttonPressedMap.circle === true)
  ) {
    console.log("TOTSU GEKI tm, left");
    console.log(prevButtonHeldMap);
    console.log(buttonHeldMap);
    console.log(buttonPressedMap);
    leftChargeTime = 0;
    addMoveRecovery(buttonHeldMap.circle ? HS_HORIZ_DOLPHIN_RECOVERY : S_HORIZ_DOLPHIN_RECOVERY);
  }

  if (rightChargeTime !== 0 &&
    rightChargeWindowLock &&
    buttonHeldMap.left === true &&
    moveRecoveryLock === false &&
    (buttonPressedMap.triangle === true || buttonPressedMap.circle === true)
  ) {
    console.log("TOTSUGEKI tm , right");
    rightChargeTime = 0;
    addMoveRecovery(buttonHeldMap.circle ? HS_HORIZ_DOLPHIN_RECOVERY : S_HORIZ_DOLPHIN_RECOVERY);
  }

  //DOWN CHARGE
  if (downChargeTime !== 0 &&
    downChargeWindowLock &&
    buttonHeldMap.up === true &&
    moveRecoveryLock === false &&
    (buttonPressedMap.triangle === true || buttonPressedMap.circle === true)
  ) {
    console.log("TOTSUGEKI tm, BUT UPWARDS");
    downChargeTime = 0;
    addMoveRecovery(buttonHeldMap.circle ? HS_VERT_DOLPHIN_RECOVERY : S_VERT_DOLPHIN_RECOVERY);
  }
}

function clearInputMap (){
  buttonHeldMap = {
    square:false,
    triangle: false,
    x:false,
    circle:false,
    l1:false,
    l2:false,
    r1:false,
    r2:false,
    up:false,
    down:false,
    right:false,
    left:false
  };
  buttonPressedMap = {
    square:false,
    triangle: false,
    x:false,
    circle:false,
    l1:false,
    l2:false,
    r1:false,
    r2:false,
    up:false,
    down:false,
    right:false,
    left:false
  }
}
function addMoveRecovery(frames) {
  moveRecoveryLock = true;
  setTimeout(()=>{
    moveRecoveryLock = false;
  }, frames * FRAME_TO_MS_CONST);
}
