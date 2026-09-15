(function () {
  const handle = document.getElementById("separator-handle") || document.getElementById("workspace-separator");
  const left = document.querySelector(".editor-pane");
  const container = document.querySelector(".workspace");
  const previewFrame = document.getElementById("html-preview");

  if (!handle || !left || !container) return;

  handle.addEventListener("pointerdown", (e) => {
    handle.setPointerCapture(e.pointerId);
    document.body.style.userSelect = "none";
    if (previewFrame) previewFrame.style.pointerEvents = "none";
  });

  handle.addEventListener("pointermove", (e) => {
    if (!handle.hasPointerCapture(e.pointerId)) return;

    const offset = e.clientX - container.getBoundingClientRect().left;
    if (offset > 180 && offset < container.clientWidth - 180) {
      left.style.flex = "none";
      left.style.width = offset + "px";
    }
  });

  function stopDrag(e) {
    if (!handle.hasPointerCapture(e.pointerId)) return;
    handle.releasePointerCapture(e.pointerId);

    document.body.style.userSelect = "";
    if (previewFrame) previewFrame.style.pointerEvents = "";

    if (window.refreshPreviewPane) window.refreshPreviewPane();
  }

  handle.addEventListener("pointerup", stopDrag);
  handle.addEventListener("pointercancel", stopDrag);
})();
