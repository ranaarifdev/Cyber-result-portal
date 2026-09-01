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

  function calculateSemesterTop10(students) {
    const semesterNumbers = [...new Set((students || []).flatMap((student) => (student.semesters || []).map((semester) => Number(semester.semesterNumber))))].sort((a, b) => a - b);
    return semesterNumbers.map((semesterNumber) => {
      const rows = [];
      students.forEach((student) => {
        const semester = (student.semesters || []).find((entry) => Number(entry.semesterNumber) === semesterNumber);
        if (!semester || semester.sgpa === null || semester.sgpa === undefined || Number.isNaN(Number(semester.sgpa))) return;
        rows.push({
          name: student.name,
          rollNumber: student.rollNumber,
          sgpa: Number(semester.sgpa),
          semesterNumber
        });
      });
      rows.sort((a, b) => Number(b.sgpa) - Number(a.sgpa) || a.name.localeCompare(b.name) || a.rollNumber.localeCompare(b.rollNumber));
      return {
        semesterNumber,
        students: rows.slice(0, 10).map((student, index) => ({
          rank: index + 1,
          name: student.name,
          rollNumber: student.rollNumber,
          sgpa: Number(student.sgpa),
          semesterNumber: student.semesterNumber
        }))
      };
    });
  }

  function renderMerit(analytics, semesterTop10) {
    const target = document.querySelector("#merit-content");
    const rankings = analytics.merit.cgpaRanking.map((student) => [student.rank, student.name, student.rollNumber, Number(student.cgpa).toFixed(2)]);
    const grid = el("div", "merit-grid");

    const semesterCard = el("article", "content-card");
    const semesterTables = semesterTop10.map((semester) => {
      const tableNode = table(["Rank", "Student", "Roll number", "SGPA"], semester.students.map((student) => [student.rank, student.name, student.rollNumber, Number(student.sgpa).toFixed(2)]));
      const wrapper = el("div", "semester-rankings");
      const title = el("h4", "", `Semester ${semester.semesterNumber}`);
      wrapper.append(title, tableNode);
      return wrapper;
    });
    semesterCard.append(el("h3", "", "Top 10 students by semester"));
    semesterTables.forEach((section) => semesterCard.append(section));

    const cgpaCard = el("article", "content-card");
    cgpaCard.append(el("h3", "", "CGPA ranking"), table(["Rank", "Student", "Roll number", "CGPA"], rankings));
    grid.append(semesterCard, cgpaCard);
    target.replaceChildren(grid);
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
      const studentsUrl = new URL("assets/data/students.json", document.baseURI);
      const [analyticsResponse, studentsResponse] = await Promise.all([
        fetch(analyticsUrl, { cache: "no-store" }),
        fetch(studentsUrl, { cache: "no-store" })
      ]);
      if (!analyticsResponse.ok) throw new Error("Portal section data request failed");
      if (!studentsResponse.ok) throw new Error("Student dataset request failed");
      const analytics = await analyticsResponse.json();
      const studentsData = await studentsResponse.json();
      if (!analytics.merit || !Array.isArray(analytics.merit.cgpaRanking)) throw new Error("Portal section data is invalid");
      if (!studentsData || !Array.isArray(studentsData.students)) throw new Error("Student dataset is invalid");
      const semesterTop10 = calculateSemesterTop10(studentsData.students);
      renderMerit(analytics, semesterTop10);
    } catch (error) {
      console.error("Unable to load portal sections", error);
      ["#merit-content"].forEach((selector) => {
        const target = document.querySelector(selector); if (target) target.replaceChildren(el("p", "unavailable-note", "Verified section data is currently unavailable."));
      });
    }
  }
  init();
})();
