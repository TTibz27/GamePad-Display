export const buttons =  localStorage.getItem('gamepadDisplayButtonMap')?
  localStorage.getItem('gamepadDisplayButtonMap'):
  {
  square: 2,
  triangle: 3,
  x: 0,
  circle: 1,
  l1: 4,
  l2: 6,
  r1: 5,
  r2: 7,
  up: 12,
  down: 13,
  left: 14,
  right: 15
};
//default map is for switch pro controller because it's all I had nearby working on this.

export function getControllerButtonMap (rawButtonNumber) {
  for (let button in buttons) {

  }
}


