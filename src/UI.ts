const el = document.getElementById("objective") as HTMLDivElement;
const img = document.getElementById("cutu") as HTMLImageElement;
export function showObjective(text: string, val?: boolean) {
  el.innerText = text;
  el.style.opacity = "1";
  if (val === true) {
    el.style.fontSize = "40px";
  }
}

export function showPlaylist() {
  img.style.opacity = "1";
  img.style.pointerEvents = "auto";
}

export function hidePlaylist() {
  img.style.opacity = "0";
  img.style.pointerEvents = "none";
}
