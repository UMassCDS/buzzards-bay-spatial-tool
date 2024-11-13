export function RedColorGradient(value) {
  if (value < 0) {
    value = 0;
  } else if (value > 1) {
    value = 1;
  }

  const RED = 255;
  const WHITE = 255 - value * 255;

  const color = `rgb(${RED}, ${WHITE}, ${WHITE})`;
  return color;
}
