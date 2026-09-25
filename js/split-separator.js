// Splitter / Drag Handle logic with instant scale sync
(function () {
  const handle =
    document.getElementById("separator-handle") ||
    document.getElementById("workspace-separator");
  const left = document.querySelector(".editor-pane");
  const container = document.querySelector(".workspace");
  const previewFrame = document.getElementById("html-preview");

  if (!handle || !left || !container) return;

  function triggerIframeFit() {
    try {
      if (
        previewFrame &&
        previewFrame.contentWindow &&
        typeof previewFrame.contentWindow.fitEmail === "function"
      ) {
        previewFrame.contentWindow.fitEmail();
      }
    } catch (_) {}
  }

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
      triggerIframeFit();
    }
  });

  function stopDrag(e) {
    if (!handle.hasPointerCapture(e.pointerId)) return;
    handle.releasePointerCapture(e.pointerId);

    document.body.style.userSelect = "";
    if (previewFrame) previewFrame.style.pointerEvents = "";

    triggerIframeFit();
  }

  handle.addEventListener("pointerup", stopDrag);
  handle.addEventListener("pointercancel", stopDrag);
})();
