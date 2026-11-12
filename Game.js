import Player from "./Player.js";
import { intersects } from "./collision.js";

export default class Game {
  constructor(canvas, input, onChange) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.input = input;
    this.onChange = onChange;
    this.best = this.readBest();
    this.state = "ready";
    this.score = 0;
    this.lastTime = 0;
    this.elapsed = 0;

    // Пять платформ уровня + две безопасные части земли.
    this.platforms = [
      { x: 0, y: 470, w: 350, h: 70, kind: "ground" },
      { x: 265, y: 390, w: 135, h: 18 },
      { x: 425, y: 310, w: 130, h: 18 },
      { x: 570, y: 390, w: 135, h: 18 },
      { x: 700, y: 310, w: 125, h: 18 },
      { x: 815, y: 390, w: 145, h: 18 },
      { x: 560, y: 470, w: 400, h: 70, kind: "ground" }
    ];
    this.hazard = { x: 350, y: 485, w: 210, h: 55 };
    this.finish = { x: 890, y: 330, w: 48, h: 60 };
    this.player = new Player(55, 428);
    this.collectibles = [];
    this.resetCollectibles();
    this.emit();
  }

  resetCollectibles() {
    this.collectibles = [
      { x: 320, y: 350, r: 12, collected: false },
      { x: 485, y: 270, r: 12, collected: false },
      { x: 755, y: 270, r: 12, collected: false }
    ];
  }

  readBest() {
    try { return Number(localStorage.getItem("pixelCampusBest") || 0); }
    catch (error) { return 0; }
  }

  saveBest() {
    if (this.score <= this.best) return;
    this.best = this.score;
    try { localStorage.setItem("pixelCampusBest", String(this.best)); }
    catch (error) { /* Игра продолжает работать, даже если хранилище недоступно. */ }
  }

  emit() {
    this.onChange({
      score: this.score,
      best: this.best,
      state: this.state,
      collected: this.collectibles.filter(item => item.collected).length
    });
  }

  start() {
    if (this.state === "won" || this.state === "lost") this.reset();
    this.state = "running";
    this.lastTime = 0;
    this.emit();
  }

  pause() {
    if (this.state !== "running") return;
    this.state = "paused";
    this.input.clear();
    this.lastTime = 0;
    this.emit();
  }

  reset() {
    this.score = 0;
    this.elapsed = 0;
    this.player.reset();
    this.resetCollectibles();
    this.state = "ready";
    this.input.clear();
    this.lastTime = 0;
    this.emit();
  }

  update(dt) {
    if (this.state !== "running") return;
    this.elapsed += dt;
    this.player.update(dt, this.input, this.platforms);

    // Сбор каждого предмета только один раз.
    for (const item of this.collectibles) {
      if (!item.collected) {
        const box = { x: item.x - item.r, y: item.y - item.r, w: item.r * 2, h: item.r * 2 };
        if (intersects(this.player, box)) {
          item.collected = true;
          this.score += 1;
          this.emit();
        }
      }
    }

    if (intersects(this.player, this.hazard) || this.player.y > this.canvas.height + 30) {
      this.finishGame("lost");
      return;
    }

    if (intersects(this.player, this.finish)) {
      if (this.score === this.collectibles.length) this.finishGame("won");
      else this.onChange({ score: this.score, best: this.best, state: this.state,
        collected: this.score, notice: "Сначала собери все пропуска!" });
    }
  }

  finishGame(result) {
    this.state = result;
    this.input.clear();
    this.saveBest();
    this.emit();
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);
    this.drawBackground(ctx, w, h);
    this.drawPlatforms(ctx);
    this.drawHazard(ctx);
    this.drawCollectibles(ctx);
    this.drawFinish(ctx);
    this.player.draw(ctx);
    this.drawForeground(ctx);
  }

  drawBackground(ctx, w, h) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#223e5b"); gradient.addColorStop(1, "#172b43");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);

    // Мягкие облака
    ctx.fillStyle = "rgba(206,231,245,.10)";
    for (const [x,y,s] of [[115,95,1],[410,65,.7],[760,105,.9]]) {
      ctx.beginPath(); ctx.arc(x,y,18*s,0,Math.PI*2);
      ctx.arc(x+20*s,y-8*s,23*s,0,Math.PI*2);
      ctx.arc(x+43*s,y,16*s,0,Math.PI*2); ctx.fill();
    }
    // Силуэты зданий на заднем плане
    ctx.fillStyle = "#1b334d";
    for (let i=0;i<9;i++) {
      const x=i*118-20, bh=90+(i*37%65);
      ctx.fillRect(x, 470-bh, 82, bh);
      ctx.fillStyle = "#2b4962";
      for(let row=0;row<3;row++) for(let col=0;col<3;col++)
        ctx.fillRect(x+13+col*22, 470-bh+18+row*22, 8, 9);
      ctx.fillStyle = "#1b334d";
    }
    // Линия горизонта
    ctx.fillStyle = "#29455e"; ctx.fillRect(0, 462, w, 8);
  }

  drawPlatforms(ctx) {
    for (const p of this.platforms) {
      if (p.kind === "ground") {
        ctx.fillStyle = "#335d59"; ctx.fillRect(p.x,p.y,p.w,p.h);
        ctx.fillStyle = "#63b99a"; ctx.fillRect(p.x,p.y,p.w,7);
        ctx.fillStyle = "rgba(11,35,47,.25)";
        for(let x=p.x+10;x<p.x+p.w;x+=28) ctx.fillRect(x,p.y+20,12,4);
      } else {
        ctx.fillStyle = "#14263a"; ctx.fillRect(p.x+4,p.y+10,p.w,p.h);
        ctx.fillStyle = "#527f83"; ctx.fillRect(p.x,p.y,p.w,p.h);
        ctx.fillStyle = "#8ad4bb"; ctx.fillRect(p.x,p.y,p.w,5);
        ctx.fillStyle = "#365d68"; ctx.fillRect(p.x+10,p.y+8,p.w-20,4);
      }
    }
  }

  drawHazard(ctx) {
    const h = this.hazard;
    ctx.fillStyle = "#7b344b"; ctx.fillRect(h.x,h.y,h.w,h.h);
    ctx.fillStyle = "#ef6475";
    for(let x=h.x+8;x<h.x+h.w;x+=22) {
      ctx.beginPath(); ctx.moveTo(x,h.y+1); ctx.lineTo(x+10,h.y-13);
      ctx.lineTo(x+20,h.y+1); ctx.fill();
    }
    ctx.fillStyle = "rgba(255,100,120,.17)";
    ctx.fillRect(h.x,h.y+12,h.w,h.h-12);
    ctx.fillStyle = "#ffb1a6"; ctx.font = "800 10px Manrope";
    ctx.textAlign = "center"; ctx.fillText("ОПАСНАЯ ЗОНА", h.x+h.w/2, 525);
  }

  drawCollectibles(ctx) {
    for (const item of this.collectibles) {
      if (item.collected) continue;
      const pulse = 1 + Math.sin(this.elapsed*5 + item.x)*.08;
      ctx.save(); ctx.translate(item.x,item.y); ctx.scale(pulse,pulse);
      ctx.shadowColor = "#ffd166"; ctx.shadowBlur = 18;
      ctx.fillStyle = "#ffd166";
      ctx.beginPath(); ctx.arc(0,0,item.r,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#79532a"; ctx.font = "bold 13px Arial";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("★",0,1);
      ctx.restore();
    }
  }

  drawFinish(ctx) {
    const f = this.finish;
    ctx.fillStyle = "#20344a"; ctx.fillRect(f.x+7,f.y+10,7,130);
    ctx.fillStyle = "#62e5d3";
    ctx.beginPath(); ctx.moveTo(f.x+14,f.y+10); ctx.lineTo(f.x+53,f.y+22);
    ctx.lineTo(f.x+14,f.y+36); ctx.fill();
    ctx.fillStyle = "#d9fff5"; ctx.font = "800 9px Manrope";
    ctx.textAlign = "center"; ctx.fillText("ФИНИШ",f.x+26,f.y+51);
    if (this.score < 3) {
      ctx.fillStyle = "#ffd166"; ctx.font = "bold 10px Manrope";
      ctx.fillText("3/3",f.x+26,f.y+67);
    }
  }

  drawForeground(ctx) {
    ctx.fillStyle = "rgba(8,18,31,.28)";
    ctx.fillRect(0,0,960,4);
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.font = "700 10px Manrope";
    ctx.textAlign = "left";
    ctx.fillText("КАМПУС • СЕКТОР А",20,25);
    ctx.textAlign = "right";
    ctx.fillText("ДОСТАВКА ПОСЫЛКИ",940,25);
  }
}
