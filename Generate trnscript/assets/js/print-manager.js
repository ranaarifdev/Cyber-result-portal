"use strict";

window.PortalPrint = Object.freeze({
  print(documentNode, filename, isDownload = false) {
    if (!documentNode) {
      window.alert("The selected academic document is not available.");
      return;
    }
    if (isDownload && !window.PORTAL_CONFIG.allowDownloads) {
      window.alert("Downloads are disabled in the portal configuration.");
      return;
    }
    document.querySelectorAll(".printable-document").forEach((node) => node.classList.remove("active-print-document"));
    documentNode.classList.add("active-print-document");
    document.body.classList.add("printing-document");
    const originalTitle = document.title;
    document.title = filename.replace(/\.pdf$/i, "");
    const cleanUp = () => {
      document.title = originalTitle;
      documentNode.classList.remove("active-print-document");
      document.body.classList.remove("printing-document");
      window.removeEventListener("afterprint", cleanUp);
    };
    window.addEventListener("afterprint", cleanUp);
    if (isDownload) window.alert('In the print dialog, select "Save as PDF" to download this document.');
    try {
      window.print();
      window.setTimeout(cleanUp, 60000);
    } catch (error) {
      console.error("Print operation failed", error);
      cleanUp();
      window.alert("The browser could not open its print dialog. Please use the browser print command and try again.");
    }
  }
});
