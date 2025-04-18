document.addEventListener("mouseup", async () => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText && !event.target.closest("#text-explainer-popup")) {
    try {
      const range = window.getSelection().getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const x = rect.left + window.scrollX;
      const y = rect.bottom + window.scrollY + 8;

      chrome.runtime.sendMessage(
        {
          type: "textSelected",
          text: selectedText,
          x,
          y,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Messaging error:", chrome.runtime.lastError.message);
          } else {
            console.log("Message sent successfully:", response);
          }
        }
      );
    } catch (err) {
      console.error("Error during selection or messaging:", err);
    }
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "showFloatingPopup") {
    const existingPopup = document.getElementById("text-explainer-popup");
    if (existingPopup) {
      existingPopup.remove();
    }

    const popup = document.createElement("div");
    popup.id = "text-explainer-popup";
    popup.style.cssText = `
      position: absolute;
      top: ${message.y}px;
      left: ${message.x}px;
      z-index: 10000;
      background: #242533;
      width: 300px;
      max-height: 400px;
      overflow-y: auto;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 1px 3px 2px 0px rgba(0,0,0,0.10);
    `;

    const header = document.createElement("div");
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
      margin-bottom: 10px;
    `;
    header.innerHTML = `
      <h3 style="margin: 0; font-size: 16px; color: white;">Clarify</h3>
      <button id="close-explanation-popup" style="background: none; border: none; cursor: pointer; font-size: 16px; color: white;">×</button>
    `;

    const content = document.createElement("div");
    content.id = "explanation-content";
    content.style.cssText = `
      font-size: 14px;
      line-height: 1.5;
      color: white;
    `;
    content.textContent = "Loading explanation...";

    popup.appendChild(header);
    popup.appendChild(content);
    document.body.appendChild(popup);

    const closePopup = document.getElementById("close-explanation-popup");
    closePopup.addEventListener("click", () => {
      popup.remove();
    });

    fetchExplanation(message.text);
  }
});

async function fetchExplanation(text) {
  try {
    const response = await fetch(
      "https://336d-38-224-232-103.ngrok-free.app/api/explain/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    const data = await response.json();
    const explanationContent = document.getElementById("explanation-content");
    if (explanationContent) {
      explanationContent.textContent = data || "no explanation available";
    }
  } catch (err) {
    console.error("Error fetching explanation:", err);
    const explanationContent = document.getElementById("explanation-content");
    explanationContent.textContent = "Error fetching explanation.";
  }
}
