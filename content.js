document.addEventListener("mouseup", async () => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText.length > 0) {
    const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();

    const popup = document.createElement("div");
    popup.style.cssText = `
        position: fixed;
        top: ${rect.bottom + window.scrollY}px;
        left: ${rect.left + window.scrollX}px;
        background: white;
        border: 1px solid #ccc;
        padding: 10px;
        z-index: 999999;
        max-width: 300px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        color: black;
      `;

    document.body.appendChild(popup);

    const data = "Demo text";
    popup.innerText = data;
  }
});
