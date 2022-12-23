// main.js
import * as buttonMapper from "./buttonMapper.js";
import {buttons} from "./buttonMapper.js";

const FRAME_TO_MS_CONST = 16.66666666;
const CHARGE_BUFFER_FRAMES = 30;
const CHARGE_TRAVEL_FRAMES = 10;
const S_HORIZ_DOLPHIN_RECOVERY = 15;
const HS_HORIZ_DOLPHIN_RECOVERY = 15;
const S_VERT_DOLPHIN_RECOVERY =30;
const HS_VERT_DOLPHIN_RECOVERY = 32;
const BUTTON_PRESS_WINDOW = 3;

const PREJUMP_FRAMES = 4;
const NEUTRAL_JUMP_HANGTIME = 36;


let gamePadIndex;
let leftChargeTime = 0;
let rightChargeTime = 0;
let downChargeTime = 0;

let totsugekiCount = 0;

let leftChargeWindowLock = false;
let rightChargeWindowLock = false;
let isDownChargeWindowStill  =false;
let sJustPressed = false;
let hsJustPressed = false;
let otherButtonJustPressed = false; // this is to cancel out RC or FD or Burst

let moveRecoveryLock = false;

let likelyAirborne = false;
let handlingJump = false;
let debugTimerStart= 0;


let buttonHeldMap = {};
let prevButtonHeldMap ={};
let buttonPressedMap = {};


const queryString = window.location.search;
console.log("Button Layout Type A");

if (queryString === '?totsugeki'){
  document.getElementById("StatusHeader").style.visibility = 'hidden';
  document.getElementById("fullButtonMap").style.visibility = 'hidden';
}

window.addEventListener("gamepadconnected", (e) => {
  //console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
  //   e.gamepad.index, e.gamepad.id,
  //   e.gamepad.buttons.length, e.gamepad.axes.length);
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
  clearInputMap();

  gp.buttons.forEach((button, index)=>{
    if (button.pressed) {
      const id = getButtonMapID(index, true);
      if (id != null){
        document.getElementById(id).classList.add('button-indicator-pressed');
        document.getElementById(id).classList.remove('button-indicator');
      }

      getDirectionMap(index);

    }
    else {
      const id = getButtonMapID(index, false);
      if (id != null) {
        document.getElementById(id).classList.add('button-indicator');
        document.getElementById(id).classList.remove('button-indicator-pressed');
      }
    }
  });

  moveFromDirectionMapValues();
  checkButtonPress();
  if (!likelyAirborne){
    checkChargeMove();
  }
  else {
    console.log("AIRBORNE!!!!")
  }


  prevButtonHeldMap = Object.assign({}, buttonHeldMap);
  requestAnimationFrame(gameLoop);
}

function getButtonMapID(i, pressed){

  const buttons = buttonMapper.buttons;
  switch (i){
    case buttons.up:
      if ( prevButtonHeldMap.up ===false &&  pressed === true ) {setJumpTimer();}
      return null; // returning a value forces a check for a display button. add this here for hitbox button indicators.
    case buttons.x:
      buttonHeldMap.x = pressed;
      if (prevButtonHeldMap.x === false && pressed === true) {buttonPressedMap.x = true;}
      return "x-button";
    case buttons.circle:
      buttonHeldMap.circle = pressed;
      if (prevButtonHeldMap.circle === false && pressed === true) {buttonPressedMap.circle = true;}
      return "circle-button";
    case buttons.square:
      buttonHeldMap.square = pressed;
      if (prevButtonHeldMap.square === false && pressed === true) {buttonPressedMap.square = true;}
      return "square-button";
    case buttons.triangle:
      buttonHeldMap.triangle = pressed;
      if (prevButtonHeldMap.triangle === false && pressed === true) {buttonPressedMap.triangle = true;}
      return "triangle-button";
    case buttons.l1:
      buttonHeldMap.l1 = pressed;
      if (prevButtonHeldMap.l1 === false && pressed === true) {buttonPressedMap.l1 = true;}
      return "l1-button";
    case buttons.r1:
      buttonHeldMap.r1 = pressed;
      if (prevButtonHeldMap.r1 === false && pressed === true) {buttonPressedMap.r1 = true;}
      return "r1-button";
    case buttons.l2:
      buttonHeldMap.l2 = pressed;
      if (prevButtonHeldMap.l2 === false && pressed === true) {buttonPressedMap.l2 = true;}
      return "l2-button";
    case buttons.r2:
      buttonHeldMap.r2 = pressed;
      if (prevButtonHeldMap.r2 === false && pressed === true) {buttonPressedMap.r2 = true;}
      return "r2-button";
    default:
      return null;
  }
}

function getDirectionMap(i){
  switch (i){
    case buttons.up:
      buttonHeldMap.up = true;
      return "up";
    case buttons.down:
      buttonHeldMap.down = true;
      return "down";
    case buttons.left:
      buttonHeldMap.left = true;
      return "left";
    case buttons.right:
      buttonHeldMap.right = true;
      return "right";
    default:
      return null;
  }
}
function moveFromDirectionMapValues(){
  let leftPos = 45;
  let upPos = 45;

    if (buttonHeldMap.up === true) {
      upPos -= 45;
    }
    if (buttonHeldMap.down === true) {
      upPos += 45;
    }
    if (buttonHeldMap.left === true) {
      leftPos -= 45;
    }
    if (buttonHeldMap.right === true) {
      leftPos += 45;
    }

    //SOCD cleaning, up is "absolute"
    if ( buttonHeldMap.left &&  buttonHeldMap.right){
      buttonHeldMap.left = false;
      buttonHeldMap.right = false;
    }

    if (buttonHeldMap.left === true){
      if( leftChargeTime === 0){
        leftChargeTime = Date.now();
        //console.log(leftChargeTime);
      }
      if (Date.now() - leftChargeTime > CHARGE_BUFFER_FRAMES * FRAME_TO_MS_CONST){
        //console.log("left Charge buffered!");
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
            //console.log("Travel Window ended");
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
        //console.log(rightChargeTime);
      }
      if (Date.now() - rightChargeTime > CHARGE_BUFFER_FRAMES * FRAME_TO_MS_CONST){
        //console.log("right Charge buffered!");
      }
    }
    else {
      if (rightChargeTime !==0 &&  Date.now() - rightChargeTime > CHARGE_BUFFER_FRAMES * FRAME_TO_MS_CONST){
        rightChargeWindowLock = true;
        setTimeout( ()=>{
          rightChargeWindowLock = false;
          rightChargeTime = 0;
          //console.log("Travel Window ended");
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
        //console.log(downChargeTime);
      }
      if (Date.now() - downChargeTime > CHARGE_BUFFER_FRAMES * FRAME_TO_MS_CONST){
        //console.log("down Charge buffered!");
      }
    }
    else {
      if (downChargeTime !==0 &&  Date.now() - downChargeTime > CHARGE_BUFFER_FRAMES * FRAME_TO_MS_CONST){
        isDownChargeWindowStill = true;
        setTimeout( ()=>{
          isDownChargeWindowStill = false;
          downChargeTime = 0;
          //console.log("Travel Window ended");
        },FRAME_TO_MS_CONST * CHARGE_TRAVEL_FRAMES);
      }
      else {
        if (!isDownChargeWindowStill) {
          downChargeTime = 0;
        }
      }
    }

    document.getElementById('dpad-indication').style.left = (leftPos) + 'px';
    document.getElementById('dpad-indication').style.top = (upPos) + 'px';
}

function checkButtonPress(){
  if (buttonPressedMap.triangle){
    sJustPressed = true;
    setTimeout( ()=>{
      sJustPressed = false;
    }, BUTTON_PRESS_WINDOW * FRAME_TO_MS_CONST);
  }
  if (buttonPressedMap.r1){
    hsJustPressed = true;
    setTimeout( ()=>{
      hsJustPressed = false;
    }, BUTTON_PRESS_WINDOW * FRAME_TO_MS_CONST);
  }
  if (buttonPressedMap.square || buttonPressedMap.circle ||buttonPressedMap.x || buttonPressedMap.r2){
    otherButtonJustPressed = true;
    setTimeout( ()=>{
      otherButtonJustPressed = false;
    }, BUTTON_PRESS_WINDOW * FRAME_TO_MS_CONST);
  }
}
function checkChargeMove() {

  //  if (
  //   !leftChargeWindowLock &&
  //   (buttonPressedMap.triangle === true || buttonPressedMap.circle === true)
  // ) {
  //   console.log("no window lock");
  // }
  //  if (
  //   moveRecoveryLock === true &&
  //   (buttonPressedMap.triangle === true || buttonPressedMap.circle === true)
  // ) {
  //   console.log("still move recovery");
  // }
  //  if (leftChargeTime === 0 &&
  //   (buttonPressedMap.triangle === true || buttonPressedMap.circle === true)
  // ) {
  //   console.log("everything but charge");
  // }
  //  if (
  //   buttonHeldMap.right === false &&
  //   (buttonPressedMap.triangle === true || buttonPressedMap.circle === true)
  // ) {
  //   console.log("no right input");
  // }


  //left charge
  if (leftChargeTime !== 0 &&                                      // enough charge time
    leftChargeWindowLock &&                                        // within travel window
    buttonHeldMap.right === true &&                                //hitting forward
    moveRecoveryLock === false &&                                  // not in move recovery
    (sJustPressed === true || hsJustPressed === true) &&           // S or H pressed
    !(sJustPressed && hsJustPressed) &&                            // but not both bc that's RC or Faultless or a different input
    !otherButtonJustPressed                                        // or any other buttons pressed
  ) {
    leftChargeTime = 0;
    addMoveRecovery(hsJustPressed ? HS_HORIZ_DOLPHIN_RECOVERY : S_HORIZ_DOLPHIN_RECOVERY);
    handleTotsugeki(sJustPressed? 's':'hs');
  }

  //right charge
  if (rightChargeTime !== 0 &&
    rightChargeWindowLock &&
    buttonHeldMap.left === true &&
    moveRecoveryLock === false &&
    (sJustPressed === true || hsJustPressed === true) &&
    !(sJustPressed && hsJustPressed) &&
    !otherButtonJustPressed
  ) {
    rightChargeTime = 0;
    addMoveRecovery(hsJustPressed ? HS_HORIZ_DOLPHIN_RECOVERY : S_HORIZ_DOLPHIN_RECOVERY);
    handleTotsugeki(sJustPressed? 's':'hs');
  }



   if (
    !isDownChargeWindowStill &&
     (buttonPressedMap.triangle === true || buttonPressedMap.circle === true)
  ) {
    console.log("no window lock");
  }
   if (
    moveRecoveryLock === true &&
     (buttonPressedMap.triangle === true || buttonPressedMap.circle === true)
  ) {
    console.log("still move recovery");
  }
   if (downChargeTime === 0 &&
     (buttonPressedMap.triangle === true || buttonPressedMap.circle === true)
  ) {
    console.log("everything but charge");
  }
   if (
    buttonHeldMap.up === false &&
     (buttonPressedMap.triangle === true || buttonPressedMap.circle === true)
  ) {
    console.log("no up input");
  }



  //DOWN CHARGE
  if (downChargeTime !== 0 &&
    isDownChargeWindowStill &&
    buttonHeldMap.up === true &&
    moveRecoveryLock === false &&
    (sJustPressed === true || hsJustPressed === true) &&
    !(sJustPressed && hsJustPressed) &&
    !otherButtonJustPressed
  ) {
    downChargeTime = 0;
    likelyAirborne = false;
    handlingJump = false;
    addMoveRecovery(hsJustPressed ? HS_VERT_DOLPHIN_RECOVERY : S_VERT_DOLPHIN_RECOVERY);
    handleTotsugeki(sJustPressed? 's':'hs');
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

function handleTotsugeki(buttonString) {

  setTimeout( () => {
    if(!otherButtonJustPressed ||
      (buttonString === 'hs' && sJustPressed)||
      (buttonString === 's' && hsJustPressed) ){ // two frame window after totsugeki to allow for RC or Burst or whatever
      totsugekiCount ++;
      document.getElementById("totsugekiCountSpan").innerHTML = totsugekiCount + "";
    }

  }, FRAME_TO_MS_CONST * BUTTON_PRESS_WINDOW);

}

function DEBUG_TIMER(){
  if (debugTimerStart === 0){
  debugTimerStart = Date.now();
  console.log("started debug timer");
  }
  else {
    console.log( "frames: "  +  ((Date.now() - debugTimerStart) / FRAME_TO_MS_CONST));
    debugTimerStart = 0;
  }
}

function setJumpTimer() {
  handlingJump = true;    //handle the prejump here
  setTimeout(()=>{
    //prejump
    if (!otherButtonJustPressed && !sJustPressed && !hsJustPressed && !moveRecoveryLock){  // this should filter out some up inputs or if the button happened already
      likelyAirborne = true;
      setTimeout(()=>{ // in 36 frames, clear everything
        likelyAirborne = false;
        handlingJump = false;
      }, (NEUTRAL_JUMP_HANGTIME ) * FRAME_TO_MS_CONST);
    }
    else  {
      //not a valid jump because of a move, probably
      handlingJump = false;
    }
  }, (PREJUMP_FRAMES) * FRAME_TO_MS_CONST);

}
