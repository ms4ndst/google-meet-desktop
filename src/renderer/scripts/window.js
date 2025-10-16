const homeButton = document.getElementById("home");
const minimizeButton = document.getElementById("minimize");
const maximizeButton = document.getElementById("maximize");
const restoreButton = document.getElementById("restore");
const closeButton = document.getElementById("close");
const pipButton = document.getElementById("togglePiP");
const notesButton = document.getElementById("toggleNotes");

restoreButton.style.display = "none";

homeButton.addEventListener("click", () => {
  window.ipc.send("window.home");
});
minimizeButton.addEventListener("click", () => {
  window.ipc.send("window.minimize");
});
maximizeButton.addEventListener("click", () => {
  window.ipc.send("window.maximize");
});
restoreButton.addEventListener("click", () => {
  window.ipc.send("window.restore");
});
closeButton.addEventListener("click", () => {
  window.ipc.send("window.close");
});

pipButton.addEventListener("click", () => {
  window.ipc.send("toggle:pip");
});

notesButton.addEventListener("click", () => {
  window.ipc.send("toggle:notes");
});

window.ipc.on("window.maximized", () => {
  maximizeButton.style.display = "none";
  restoreButton.style.display = "flex";
});
window.ipc.on("window.restored", () => {
  maximizeButton.style.display = "flex";
  restoreButton.style.display = "none";
});
