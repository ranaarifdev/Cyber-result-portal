"use strict";

(() => {
  if (document.body.dataset.page !== "home") return;
  const el = (tag, className, textOrChildren) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (Array.isArray(textOrChildren)) {
      textOrChildren.filter(Boolean).forEach((child) => node.append(child));
    } else if (textOrChildren !== undefined) {
      node.textContent = textOrChildren;
    }
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
        if (!semester) return;
        
        // Use cumulative CGPA for this semester (for Semester 1, SGPA is the cumulative CGPA)
        const cgpaValue = semester.cgpa !== null && semester.cgpa !== undefined ? semester.cgpa : semester.sgpa;
        if (cgpaValue === null || cgpaValue === undefined || Number.isNaN(Number(cgpaValue))) return;
        
        rows.push({
          name: student.name,
          rollNumber: student.rollNumber,
          cgpa: Number(cgpaValue),
          semesterNumber
        });
      });
      rows.sort((a, b) => Number(b.cgpa) - Number(a.cgpa) || a.name.localeCompare(b.name) || a.rollNumber.localeCompare(b.rollNumber));
      return {
        semesterNumber,
        students: rows.slice(0, 10).map((student, index) => ({
          rank: index + 1,
          name: student.name,
          rollNumber: student.rollNumber,
          cgpa: Number(student.cgpa),
          semesterNumber: student.semesterNumber
        }))
      };
    });
  }

  function calculateOverallCGPARanking(students) {
    const rows = [];
    (students || []).forEach((student) => {
      let cgpa = student.overallCGPA;
      if (cgpa === null || cgpa === undefined || Number.isNaN(Number(cgpa))) {
        const sortedSems = (student.semesters || []).slice().sort((a, b) => Number(b.semesterNumber) - Number(a.semesterNumber));
        if (sortedSems[0]) {
          cgpa = sortedSems[0].cgpa !== null && sortedSems[0].cgpa !== undefined ? sortedSems[0].cgpa : sortedSems[0].sgpa;
        }
      }
      if (cgpa !== null && cgpa !== undefined && !Number.isNaN(Number(cgpa))) {
        rows.push({
          name: student.name,
          rollNumber: student.rollNumber,
          cgpa: Number(cgpa)
        });
      }
    });
    rows.sort((a, b) => Number(b.cgpa) - Number(a.cgpa) || a.name.localeCompare(b.name) || a.rollNumber.localeCompare(b.rollNumber));
    return rows.slice(0, 10).map((student, index) => ({
      rank: index + 1,
      name: student.name,
      rollNumber: student.rollNumber,
      cgpa: Number(student.cgpa)
    }));
  }

  function renderMerit(overallRankings, semesterTop10, methodologyText) {
    const target = document.querySelector("#merit-content");
    const rankings = overallRankings.map((student) => [student.rank, student.name, student.rollNumber, Number(student.cgpa).toFixed(2)]);
    const grid = el("div", "merit-grid");

    const semesterCard = el("article", "content-card");
    const semesterTables = semesterTop10.map((semester) => {
      const tableNode = table(["Rank", "Student", "Roll number", "CGPA"], semester.students.map((student) => [student.rank, student.name, student.rollNumber, Number(student.cgpa).toFixed(2)]));
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
    const methodologyEl = document.querySelector("#merit-methodology");
    if (methodologyEl) {
      methodologyEl.textContent = methodologyText || "Rankings are generated automatically based on official cumulative CGPA values of every semester. Ties are sorted by student name and incomplete records are excluded.";
    }
  }

  function bindFeedback() {
    const form = document.querySelector("#feedback-form");
    if (!form) return;
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
      const studentsUrl = new URL("assets/data/students.json", document.baseURI);
      const studentsResponse = await fetch(studentsUrl, { cache: "no-store" });
      if (!studentsResponse.ok) throw new Error("Student dataset request failed");
      const studentsData = await studentsResponse.json();
      if (!studentsData || !Array.isArray(studentsData.students)) throw new Error("Student dataset is invalid");

      let overallRankings = null;
      let methodology = "Rankings are generated automatically from official cumulative CGPA values for each semester. Ties are retained and incomplete records are excluded.";

      try {
        const analyticsUrl = new URL("assets/data/class-analytics.json", document.baseURI);
        const analyticsResponse = await fetch(analyticsUrl, { cache: "no-store" });
        if (analyticsResponse.ok) {
          const analytics = await analyticsResponse.json();
          if (analytics.merit && Array.isArray(analytics.merit.cgpaRanking)) {
            overallRankings = analytics.merit.cgpaRanking;
            if (analytics.merit.methodology) methodology = analytics.merit.methodology;
          }
        }
      } catch {
        // Fallback to computing overall rankings from students dataset
      }

      if (!overallRankings) {
        overallRankings = calculateOverallCGPARanking(studentsData.students);
      }

      const semesterTop10 = calculateSemesterTop10(studentsData.students);
      renderMerit(overallRankings, semesterTop10, methodology);
    } catch (error) {
      console.error("Unable to load portal sections", error);
      ["#merit-content"].forEach((selector) => {
        const target = document.querySelector(selector);
        if (target) target.replaceChildren(el("p", "unavailable-note", "Verified section data is currently unavailable."));
      });
    }
  }
  init();
})();
