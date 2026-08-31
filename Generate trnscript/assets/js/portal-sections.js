"use strict";

(() => {
  if (document.body.dataset.page !== "home") return;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const table = (headers, rows) => {
    const wrapper = el("div", "table-scroll");
    const node = document.createElement("table");
    const headerRow = document.createElement("tr");
    headers.forEach((header) => { const th = el("th", "", header); th.scope = "col"; headerRow.append(th); });
    const body = document.createElement("tbody");
    rows.forEach((row) => { const tr = document.createElement("tr"); row.forEach((value) => tr.append(el("td", "", value))); body.append(tr); });
    const thead = document.createElement("thead"); thead.append(headerRow); node.append(thead, body); wrapper.append(node); return wrapper;
  };

  function renderMerit(analytics) {
    const target = document.querySelector("#merit-content");
    const toppers = analytics.merit.semesterToppers.flatMap((semester) => semester.students.map((student) => [
      `Semester ${semester.semesterNumber}`, student.name, student.rollNumber, Number(student.sgpa).toFixed(2)
    ]));
    const rankings = analytics.merit.cgpaRanking.map((student) => [student.rank, student.name, student.rollNumber, Number(student.cgpa).toFixed(2)]);
    const grid = el("div", "merit-grid");
    const semesterCard = el("article", "content-card"); semesterCard.append(el("h3", "", "Semester toppers"), table(["Semester", "Student", "Roll number", "SGPA"], toppers));
    const cgpaCard = el("article", "content-card"); cgpaCard.append(el("h3", "", "CGPA ranking"), table(["Rank", "Student", "Roll number", "CGPA"], rankings));
    grid.append(semesterCard, cgpaCard); target.replaceChildren(grid);
    document.querySelector("#merit-methodology").textContent = analytics.merit.methodology;
  }

  function bindFeedback() {
    const form = document.querySelector("#feedback-form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = document.querySelector("#feedback-status");
      if (!form.checkValidity()) {
        status.textContent = "Please complete your name, a valid email address, and your message.";
        status.className = "form-status error"; form.reportValidity(); return;
      }
      const name = document.querySelector("#feedback-name").value.trim();
      const email = document.querySelector("#feedback-email").value.trim();
      const message = document.querySelector("#feedback-message").value.trim();
      const subject = encodeURIComponent("Result Portal feedback");
      const body = encodeURIComponent(`Name: ${name}\nReply email: ${email}\n\n${message}`);
      status.textContent = "Opening your email application…"; status.className = "form-status";
      window.location.href = `mailto:arifranaarif66@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  async function init() {
    bindFeedback();
    try {
      const analyticsUrl = new URL("assets/data/class-analytics.json", document.baseURI);
      const analyticsResponse = await fetch(analyticsUrl, { cache: "no-store" });
      if (!analyticsResponse.ok) throw new Error("Portal section data request failed");
      const analytics = await analyticsResponse.json();
      if (!analytics.merit || !Array.isArray(analytics.merit.semesterToppers) || !Array.isArray(analytics.merit.cgpaRanking)) throw new Error("Portal section data is invalid");
      renderMerit(analytics);
    } catch (error) {
      console.error("Unable to load portal sections", error);
      ["#merit-content"].forEach((selector) => {
        const target = document.querySelector(selector); if (target) target.replaceChildren(el("p", "unavailable-note", "Verified section data is currently unavailable."));
      });
    }
  }
  init();
})();
