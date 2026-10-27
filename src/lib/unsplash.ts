// Responsive Unsplash image helper. Replace with local, optimized files (WebP/AVIF) before launch.
export function unsplash(id: string, widths: number[] = [800, 1200, 1800, 2400]) {
  const url = (w: number) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
  return {
    src: url(widths[widths.length - 1]),
    srcset: widths.map((w) => `${url(w)} ${w}w`).join(', '),
  };
}
