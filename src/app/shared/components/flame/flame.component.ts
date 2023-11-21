import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-flame',
  template: `
    <div>
      <canvas #flameCanvas></canvas>
      <img
        class="max-w-xs fixed right-0 bottom-0"
        src="assets/butane-logo.png"
        alt="Butane cylinder gas tank"
      />
    </div>
  `,
  styles: [
    `
      div {
        @media (max-width: 768px) {
          scale: 0.5;
        }
        position: fixed;
        bottom: 0;
        right: 0;

        canvas {
          position: fixed;
          bottom: 14rem;
          right: 0.5rem;
        }

        img {
          position: fixed;
          right: 0;
          bottom: 0;
          max-width: 20rem;
        }
      }
    `,
  ],
})
export class FlameComponent implements AfterViewInit {
  @ViewChild('flameCanvas', { static: false })
  private canvas: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    const canvas = this.canvas.nativeElement;

    setTimeout(() => {
      // Decrease opacity of canvas gradually and then remove it eventually to not hurt performance
      for (let i = 0; i < 100; i++) {
        setTimeout(() => {
          canvas.style.opacity = (100 - i) / 100 + '';
        }, i * 10);
      }

      setTimeout(() => {
        canvas.remove();
      }, 1000);
    }, 60000 * 5);

    class Particle {
      [x: string]: any;

      constructor() {
        this['loc'] = { x: canvas.width / 2, y: canvas.height / 2 + 50 };
        this['speed'] = { x: Math.random() * 5, y: -15 + Math.random() * 10 };
        this['radius'] = 3 + Math.random() * 12;
        this['life'] = 25 + Math.random() * 8;
        this['remaining_life'] = this['life'];
        this['color'] = { r: 252, g: 132, b: 35 };
        this['color'].r = Math.floor(252);
        this['color'].g = Math.floor(132);
        this['color'].b = Math.floor(35);
      }
    }

    canvas.height = 250;
    const ctx = canvas.getContext('2d')!;
    const particles: any = [];

    const particle_count = 100;
    for (let i = 0; i < particle_count; i++) {
      particles.push(new Particle());
    }

    function loop() {
      requestAnimationFrame(loop);
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        p.opacity = Math.round((p.remaining_life / p.life) * 100) / 100;

        const gradient = ctx.createRadialGradient(
          p.loc.x,
          p.loc.y,
          0,
          p.loc.x,
          p.loc.y,
          p.radius,
        );
        gradient.addColorStop(
          0,
          'rgba(' +
            p.color.r +
            ',' +
            p.color.g +
            ',' +
            p.color.b +
            ',' +
            p.opacity +
            ')',
        );
        gradient.addColorStop(
          0.5,
          'rgba(' +
            p.color.r +
            ',' +
            p.color.g +
            ',' +
            p.color.b +
            ',' +
            p.opacity +
            ')',
        );
        gradient.addColorStop(
          1,
          'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ', 0)',
        );

        ctx.fillStyle = gradient;
        ctx.arc(p.loc.x, p.loc.y, p.radius, 0, Math.PI * 2, false);
        ctx.fill();

        p.remaining_life--;
        p.radius--;
        p.loc.x += p.speed.x;
        p.loc.y += p.speed.y;
        if (p.remaining_life < 0 || p.radius < 0) {
          particles[i] = new Particle();
        }
      }
    }

    loop();
  }
}
