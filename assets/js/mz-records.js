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

  function processMZData(mzData) {
    if (!mzData || !Array.isArray(mzData.records)) return [];
    const studentMap = new Map();
    mzData.records.forEach((record) => {
      const key = `${record.rollNumber}`;
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          rollNumber: record.rollNumber,
          name: record.studentName,
          mz111GPA: null,
          mz112GPA: null
        });
      }
      const student = studentMap.get(key);
      if (record.courseCode === "MZ-111") {
        student.mz111GPA = Number(record.gradePoint).toFixed(2);
      } else if (record.courseCode === "MZ-112") {
        student.mz112GPA = Number(record.gradePoint).toFixed(2);
      }
    });
    return Array.from(studentMap.values()).sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
  }

  function renderMZRecords(mzData) {
    const target = document.querySelector("#mz-content");
    const students = processMZData(mzData);
    if (students.length === 0) {
      target.replaceChildren(el("div", "data-warning", "No MZ (Zero Math) records found. This typically applies to Pre-Medical students only."));
      return;
    }
    const section = el("div", "mz-records-view");
    const intro = el("div", "section-heading");
    intro.append(el("div", "", [el("p", "kicker", "Verified records"), el("h3", "", "Zero Math Student List")]));
    intro.append(el("p", "", `${students.length} student${students.length === 1 ? "" : "s"} with MZ-111 and/or MZ-112 enrollment`));
    section.append(intro);
    const rows = students.map((student) => [
      student.rollNumber,
      student.name,
      student.mz111GPA ? student.mz111GPA : "—",
      student.mz112GPA ? student.mz112GPA : "—"
    ]);
    section.append(table(["Roll Number", "Name", "MZ-111 GPA", "MZ-112 GPA"], rows));
    target.replaceChildren(section);
  }

  async function init() {
    const target = document.querySelector("#mz-content");
    if (!target) return;
    try {
      const analyticsUrl = new URL("assets/data/class-analytics.json", document.baseURI);
      const response = await fetch(analyticsUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("MZ records request failed");
      const data = await response.json();
      if (!data.mzParticipants) throw new Error("MZ participants data is missing");
      renderMZRecords(data.mzParticipants);
    } catch (error) {
      console.error("Unable to load MZ records", error);
      target.replaceChildren(el("div", "data-warning", "MZ records could not be loaded. Please refresh the page or contact support."));
    }
  }
  init();
})();
