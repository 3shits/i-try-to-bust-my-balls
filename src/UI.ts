const el = document.getElementById("objective") as HTMLDivElement;

export function showObjective(text: string, val?: boolean) {
  el.innerText = text;
  el.style.opacity = "1";
  if (val === true) {
    el.style.fontSize = "40px";
  }
}
