let appScale = 1;
if (window.innerWidth == 960 && window.innerHeight == 540) {
  appScale = 0.75;
}

export interface ImageScale {
  width: number;
  height: number;
  scaledWidth: number;
  scaledHeight: number;

}

export const scaleImage = (input : number) : number =>  Math.floor(input * appScale);

export const mainImageScale  : ImageScale = {
  width: 150,
  height: 225,
  scaledWidth: scaleImage(150),
  scaledHeight: scaleImage(225)
}


