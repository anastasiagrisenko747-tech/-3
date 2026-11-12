// Проверка пересечения двух прямоугольников.
export function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// Разрешение столкновений по вертикали и горизонтали.
// Положение до перемещения нужно, чтобы не проходить сквозь платформы.
export function resolvePlatformCollisions(player, platforms, previous) {
  // Горизонтальные столкновения со стенками платформ.
  for (const platform of platforms) {
    if (!intersects(player, platform)) continue;
    if (player.vx > 0 && previous.x + previous.w <= platform.x + 2) {
      player.x = platform.x - player.w;
    } else if (player.vx < 0 && previous.x >= platform.x + platform.w - 2) {
      player.x = platform.x + platform.w;
    }
  }

  // Вертикальные столкновения: приземление или удар головой.
  for (const platform of platforms) {
    const horizontalOverlap = player.x + player.w > platform.x &&
                              player.x < platform.x + platform.w;
    if (!horizontalOverlap) continue;

    const previousBottom = previous.y + previous.h;
    const currentBottom = player.y + player.h;
    const previousTop = previous.y;

    if (player.vy >= 0 && previousBottom <= platform.y + 5 &&
        currentBottom >= platform.y) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.onGround = true;
    } else if (player.vy < 0 && previousTop >= platform.y + platform.h - 3 &&
               player.y <= platform.y + platform.h) {
      player.y = platform.y + platform.h;
      player.vy = 0;
    }
  }
}
