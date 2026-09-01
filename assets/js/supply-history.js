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
    headers.forEach((header) => {
      const th = el("th", "", header);
      th.scope = "col";
      headerRow.append(th);
    });
    const body = document.createElement("tbody");
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((value) => tr.append(el("td", "", value)));
      body.append(tr);
    });
    const thead = document.createElement("thead");
    thead.append(headerRow);
    node.append(thead, body);
    wrapper.append(node);
    return wrapper;
  };

  function processSupplyRecords(supplyRecords) {
    // Group records by semester
    const bySemester = {};
    supplyRecords.forEach((record) => {
      const sem = record.semesterNumber;
      if (!bySemester[sem]) {
        bySemester[sem] = [];
      }
      bySemester[sem].push(record);
    });

    // Sort records within each semester by roll number
    Object.keys(bySemester).forEach((sem) => {
      bySemester[sem].sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
    });

    return bySemester;
  }

  function renderSupplyRecords(supplyData) {
    const target = document.querySelector("#supply-content");
    
    if (!supplyData || !supplyData.records || supplyData.records.length === 0) {
      target.replaceChildren(el("p", "unavailable-note", "No supply records available."));
      return;
    }

    const recordsBySemester = processSupplyRecords(supplyData.records);
    const view = el("div", "supply-records-view");

    // Render by semester
    const semesterNumbers = Object.keys(recordsBySemester).map(Number).sort((a, b) => a - b);
    semesterNumbers.forEach((semesterNumber) => {
      const semesterRecords = recordsBySemester[semesterNumber];
      const semesterSection = el("div", "semester-supply-section");
      
      const heading = el("h3", "", `Semester ${semesterNumber} – ${semesterRecords.length} supply subject${semesterRecords.length !== 1 ? 's' : ''}`);
      semesterSection.append(heading);

      const rows = semesterRecords.map((record) => [
        record.rollNumber,
        record.studentName,
        record.courseCode,
        record.courseTitle,
        record.status
      ]);

      const tableNode = table(
        ["Roll Number", "Name", "Subject Code", "Subject Name", "Status"],
        rows
      );
      semesterSection.append(tableNode);
      view.append(semesterSection);
    });

    target.replaceChildren(view);
  }

  async function init() {
    try {
      const supplyUrl = new URL("assets/data/supply-records.json", document.baseURI);
      const response = await fetch(supplyUrl, { cache: "no-store" });
      
      if (!response.ok) throw new Error("Supply records data request failed");
      
      const supplyData = await response.json();
      if (!supplyData || !Array.isArray(supplyData.records)) throw new Error("Supply records data is invalid");
      
      renderSupplyRecords(supplyData);
    } catch (error) {
      console.error("Unable to load supply records", error);
      const target = document.querySelector("#supply-content");
      if (target) target.replaceChildren(el("p", "unavailable-note", "Supply records data is currently unavailable."));
    }
  }

  init();
})();
