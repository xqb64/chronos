const SCALE = 10;
const CLOCK_RADIUS = 17;
const LETTERS_RADIUS = 5;
const LETTERS_OUTER_RADIUS = 8;

const LETTERS: Record<number, string> = {
   1: 'A',  2: 'B',  3: 'C',  4: 'D',
   5: 'E',  6: 'F',  7: 'G',  8: 'H',
   9: 'J', 10: 'K', 11: 'L', 12: 'M',
  13: 'N', 14: 'P', 15: 'Q', 16: 'R',
  17: 'S', 18: 'T', 19: 'U', 20: 'V',
  21: 'W', 22: 'X', 23: 'Y', 24: 'Z',
}

class Clock {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private timezone: HTMLSelectElement;
  private secondsDial: Vec2;
  private timezoneOffset: number;

  constructor() {
    this.timezone = document.getElementById('timezone') as HTMLSelectElement;
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.secondsDial = new Vec2(0, 1);
    this.timezoneOffset = 0;

    this.setCanvasSize(this.canvas);
    this.addEventListeners();
  }

  private addEventListeners() {
    this.timezone.addEventListener('change', () => {
      const timezone = this.timezone.value;
      const offset = parseInt(timezone.slice(4, 7));
      this.timezoneOffset = offset;
    });
  }

  private setCanvasSize(canvas: HTMLCanvasElement) {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private drawCircle(center: Vec2, r: number) {
    this.ctx.beginPath();
    this.ctx.arc(
      center.x,
      center.y,
      SCALE * r,
      0,
      2 * Math.PI,
    )
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private drawHours() {
    for (let hour = 1; hour <= 24; hour++) {
      const angle = -hour * (Math.PI / 12) - Math.PI / 2;
      const coord = new Vec2(Math.cos(angle), Math.sin(angle));
      const canvasCoord = math2Canvas(coord.scalarMul(9.5));
      const adjustedCanvasCoord = new Vec2(canvasCoord.x - 0.6 * SCALE, canvasCoord.y + 0.5 * SCALE);
      
      this.ctx.beginPath();
      this.ctx.fillStyle = 'black';
      this.ctx.fillText(hour.toString(), adjustedCanvasCoord.x, adjustedCanvasCoord.y);
      this.ctx.closePath();
    }
  }

  private drawLetters() {
    for (let hour = 1; hour <= 24; hour++) {
      const angle = -hour * (Math.PI / 12) - Math.PI / 2 + (Math.PI / 12) - this.timezoneOffset * (Math.PI / 12);
      const coord = new Vec2(Math.cos(angle), Math.sin(angle));
      const canvasCoord = math2Canvas(coord.scalarMul(6.5));
      const adjustedCanvasCoord = new Vec2(canvasCoord.x - 0.4 * SCALE, canvasCoord.y + 0.5 * SCALE);

      this.ctx.beginPath();
      this.ctx.fillStyle = 'black';
      this.ctx.fillText(LETTERS[hour], adjustedCanvasCoord.x, adjustedCanvasCoord.y);
      this.ctx.closePath();
    }
  }

  private drawTicks() {
    for (let hour = 1; hour <= 24; hour++) {
      const angle = -hour * (Math.PI / 12) + Math.PI / 2;
      const coord = new Vec2(Math.cos(angle), Math.sin(angle));
      const canvasCoord = math2Canvas(coord.scalarMul(10.5));
      const tickAttachment = math2Canvas(coord.scalarMul(12));
      
      this.ctx.beginPath();
      this.ctx.moveTo(canvasCoord.x, canvasCoord.y);
      this.ctx.lineTo(tickAttachment.x, tickAttachment.y);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  private drawMinutes() {
    for (let minute = 1; minute <= 12; minute++) {
      const angle = -minute * (Math.PI / 6) + Math.PI / 2;
      const coord = new Vec2(Math.cos(angle), Math.sin(angle));
      const canvasCoord = math2Canvas(coord.scalarMul(15.5));
      
      this.ctx.beginPath();
      this.ctx.fillStyle = 'black';
      this.ctx.fillText((5 * minute).toString(), canvasCoord.x - 0.6 * SCALE, canvasCoord.y + 0.6 * SCALE);
      this.ctx.closePath();
    }
  }

  private drawDial(angle: number, length: number) {
    const dialOrigin = math2Canvas(new Vec2(0, 0));
    const dialCoords = math2Canvas(new Vec2(Math.cos(angle), Math.sin(angle)).scalarMul(length));
    this.ctx.beginPath();
    this.ctx.moveTo(dialOrigin.x, dialOrigin.y);
    this.ctx.lineTo(dialCoords.x, dialCoords.y);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  public rotateSecondsDial() {
    this.secondsDial = this.secondsDial.rotateClockwise(Math.PI / 30);
  }

  public reDraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawCircle(math2Canvas(new Vec2(0, 0)), CLOCK_RADIUS);
    this.drawCircle(math2Canvas(new Vec2(0, 0)), LETTERS_RADIUS);
    this.drawCircle(math2Canvas(new Vec2(0, 0)), LETTERS_OUTER_RADIUS);

    this.drawHours();
    this.drawLetters();
    this.drawTicks();
    this.drawMinutes();

    const hours = new Date().getUTCHours();
    const minutes = new Date().getUTCMinutes();
    const seconds = new Date().getUTCSeconds();

    const hourAngle = (-hours - this.timezoneOffset) * (Math.PI / 12) - Math.PI / 2;
    const minutesAngle = -minutes * (Math.PI / 30) + Math.PI / 2;
    const secondsAngle = -seconds * (Math.PI / 30) + Math.PI / 2;

    this.drawDial(hourAngle, 5);
    this.drawDial(minutesAngle, 10);
    this.drawDial(secondsAngle, 15);
  }
}

class Vec2 {
  constructor(public x: number, public y: number) {};

  public scalarMul(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  public rotateClockwise(angle: number): Vec2 {
    const rotationMatrix: number[][] = [
      [Math.cos(angle), Math.sin(angle)],
      [-Math.sin(angle), Math.cos(angle)],
    ]
    const [row1, row2] = rotationMatrix;
    return new Vec2(
      this.x * row1[0] + this.y * row1[1],
      this.x * row2[0] + this.y * row2[1],
    );
  }
}

const math2Canvas = (coord: Vec2): Vec2 => {
  return new Vec2(
    SCALE * coord.x + window.innerWidth / 2,
    SCALE * -coord.y + window.innerHeight / 2,
  );
}

async function main() {
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  const clock = new Clock();

  while (true) {
    clock.rotateSecondsDial();
    clock.reDraw();
    await delay(1000);
  }
}

document.addEventListener('DOMContentLoaded', main);