"use strict";

(() => {
  const U = window.PortalUtils;
  const state = { student: null, metadata: null, active: "overview", selectedSemester: null };
  const status = document.querySelector("#page-status");
  const dashboard = document.querySelector("#result-dashboard");
  const panel = document.querySelector("#view-panel");
  const tabs = document.querySelector("#result-tabs");
  if (!status || !dashboard) return;

  function setError(message) {
    status.className = "page-state error-state";
    status.replaceChildren(U.el("h1", { text: "Result unavailable" }), U.el("p", { text: message }), U.el("a", { className: "button", href: "../index.html", text: "Back to search" }));
  }

  function renderStudentCard() {
    const s = state.student;
    const heading = U.el("div", { className: "student-heading" }, [
      U.el("div", { className: "avatar", text: s.name.slice(0, 1), "aria-hidden": "true" }),
      U.el("div", {}, [U.el("p", { className: "kicker", text: "Academic record" }), U.el("h1", { id: "student-name", text: s.name }), U.el("p", { className: "roll", text: s.rollNumber })])
    ]);
    const details = U.el("dl", { className: "student-details" });
    [["Program", s.program], ["Department", s.department], ["Faculty", s.faculty], ["Session", s.session], ["Shift", s.shift], ["Current semester", s.currentSemester], ["Overall CGPA", s.overallCGPA === null ? null : U.decimal(s.overallCGPA)], ["Status", s.status], ["Father name", s.fatherName], ["Registration no.", s.registrationNumber], ["Credits earned", s.overallCreditsEarned], ["Credits registered", s.overallCreditsAttempted]].filter(([, value]) => value !== null && value !== undefined && value !== "").forEach(([label, value]) => details.append(U.definition(label, value)));
    document.querySelector("#student-card").replaceChildren(heading, details);
  }

  function metric(label, value, note) {
    return U.el("article", { className: "metric" }, [U.el("p", { text: label }), U.el("strong", { text: U.display(value, "—") }), note ? U.el("small", { text: note }) : null]);
  }

  function renderOverview() {
    const s = state.student;
    const semesters = s.semesters;
    const courses = semesters.reduce((total, sem) => total + sem.courses.length, 0);
    const latest = semesters[semesters.length - 1];
    const section = U.el("div", { className: "overview-view" });
    section.append(U.el("div", { className: "section-heading" }, [U.el("div", {}, [U.el("p", { className: "kicker", text: "At a glance" }), U.el("h2", { text: "Academic overview" })]), U.el("p", { text: `${semesters.length} of 6 semester records available` })]));
    const metrics = U.el("div", { className: "metrics" }, [
      metric("Semester records", `${semesters.length}/6`), metric("Registered courses", courses),
      metric("Latest SGPA", U.decimal(latest.sgpa), latest.semesterTitle), metric("Overall CGPA", U.decimal(s.overallCGPA), "Official supplied value"),
      metric("Current status", s.status)
    ]);
    section.append(metrics);
    if (semesters.length < 6) section.append(U.el("div", { className: "data-warning", text: "Result record is incomplete: one or more semester rows were not present in the supplied workbook." }));
    const chart = U.el("div", { className: "progress-chart", role: "img", "aria-label": "Semester SGPA chart" });
    semesters.forEach((sem) => {
      const bar = U.el("div", { className: "chart-item" });
      bar.append(U.el("span", { text: U.decimal(sem.sgpa) }), U.el("div", { className: "bar", title: `Semester ${sem.semesterNumber} SGPA ${U.decimal(sem.sgpa)}` }), U.el("small", { text: `S${sem.semesterNumber}` }));
      bar.querySelector(".bar").style.height = `${Math.max(2, (sem.sgpa || 0) / 4 * 100)}%`;
      chart.append(bar);
    });
    section.append(U.el("section", { className: "chart-card" }, [U.el("h3", { text: "Semester SGPA progress" }), chart]));
    const table = resultTable(["Semester", "SGPA", "CGPA", "Courses", "Status"], semesters.map((sem) => [sem.semesterTitle, U.decimal(sem.sgpa), U.decimal(sem.cgpa), sem.courses.length, sem.status]));
    section.append(U.el("section", { className: "table-section" }, [U.el("h3", { text: "Academic progress" }), U.el("div", { className: "table-scroll" }, table)]));
    panel.replaceChildren(section);
  }

  function resultTable(headers, rows) {
    const table = U.el("table");
    const headRow = U.el("tr"); headers.forEach((h) => headRow.append(U.el("th", { scope: "col", text: h })));
    const tbody = U.el("tbody");
    rows.forEach((row) => { const tr = U.el("tr"); row.forEach((value) => tr.append(U.el("td", { text: U.display(value, "—") }))); tbody.append(tr); });
    table.append(U.el("thead", {}, headRow), tbody); return table;
  }

  function documentHeader(title) {
    return U.el("header", { className: "document-header" }, [
      U.el("img", { src: "../assets/images/university-logo.jpg", alt: "Emerson University Multan logo", width: 88, height: 88 }),
      U.el("div", {}, [U.el("h2", { text: state.metadata.university }), U.el("p", { text: state.metadata.department }), U.el("h3", { text: title })])
    ]);
  }

  function buildSemesterCard(number) {
    const sem = state.student.semesters.find((item) => item.semesterNumber === number);
    if (!sem) return U.el("div", { className: "data-warning", text: "This semester was not present in the supplied result workbook." });
    const card = U.el("article", { className: "result-document semester-document printable-document", id: "print-document" });
    card.append(documentHeader("Academic Result Card"));
    const details = U.el("dl", { className: "document-details" });
    [["Programme", `${state.student.program} (${state.student.shift})`], ["Session", state.student.session], ["Name", state.student.name], ["Roll No.", state.student.rollNumber]].forEach(([a,b]) => details.append(U.definition(a,b)));
    card.append(details, U.el("h4", { className: "semester-title", text: `${number}${ordinal(number)} Semester` }));
    const rows = sem.courses.map((c) => [c.courseCode, c.courseTitle, U.decimal(c.gradePoints)]);
    card.append(U.el("div", { className: "table-scroll" }, resultTable(["Course Code", "Subject Name", "Grade Point"], rows)));
    card.append(U.el("div", { className: "result-summary" }, [U.el("strong", { text: `SGPA  ${U.decimal(sem.sgpa)}` }), U.el("strong", { text: `CGPA  ${U.decimal(sem.cgpa)}` }), U.el("strong", { text: `Result Status  ${U.display(sem.status)}` })]));
    card.append(U.el("div", { className: "signature-row" }, [signature("Head of Department"), signature("Controller of Examinations")]));
    card.append(U.el("p", { className: "document-notice", text: "Computer-generated academic record based on the provided result data. Subject to verification from the university." }));
    addDocumentActions(card, `${state.student.rollNumber}-Semester-${number}-Result-Card.pdf`, "Result Card");
    return card;
  }

  function renderSemesterHub(number = state.selectedSemester) {
    const available = state.student.semesters.map((semester) => semester.semesterNumber);
    state.selectedSemester = available.includes(number) ? number : available[0];
    const selector = U.el("div", { className: "semester-selector no-print", role: "tablist", "aria-label": "Available semesters" });
    available.forEach((semesterNumber) => {
      const button = U.el("button", { type: "button", role: "tab", text: `Semester ${semesterNumber}` });
      button.setAttribute("aria-selected", semesterNumber === state.selectedSemester);
      button.addEventListener("click", () => renderSemesterHub(semesterNumber));
      selector.append(button);
    });
    panel.replaceChildren(selector, buildSemesterCard(state.selectedSemester));
  }

  function ordinal(n) { return n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"; }
  function signature(label) { return U.el("div", {}, [U.el("span", { text: "Signature Area" }), U.el("strong", { text: label })]); }

  function addDocumentActions(documentNode, filename, label) {
    const actions = U.el("div", { className: "document-actions no-print" });
    const printButton = U.el("button", { type: "button", className: "button secondary", text: `Print ${label}` });
    const downloadButton = U.el("button", { type: "button", className: "button", text: `Download ${label} as PDF` });
    printButton.addEventListener("click", () => window.PortalPrint.print(documentNode, filename, false));
    downloadButton.addEventListener("click", () => window.PortalPrint.print(documentNode, filename, true));
    downloadButton.hidden = !window.PORTAL_CONFIG.allowDownloads;
    actions.append(printButton, downloadButton);
    documentNode.append(actions);
  }

  function renderSupplyHistory() {
    const supplyRecords = (state.supplyData.records || []).filter((record) => window.PortalUtils.normalizeRoll(record.rollNumber) === window.PortalUtils.normalizeRoll(state.student.rollNumber));
    const section = U.el("div", { className: "supply-history-view" });
    section.append(U.el("div", { className: "section-heading" }, [U.el("div", {}, [U.el("p", { className: "kicker", text: "Academic history" }), U.el("h2", { text: "Supply / Fail record" })]), U.el("p", { text: `${supplyRecords.length} subject(s) with supply or fail status` })]));
    if (supplyRecords.length === 0) {
      section.append(U.el("div", { className: "data-warning", text: "No supply or fail records found for this student. Student has cleared all subjects in attempted semesters." }));
      panel.replaceChildren(section);
      return;
    }
    const byStatus = {};
    supplyRecords.forEach((record) => {
      if (!byStatus[record.status]) byStatus[record.status] = [];
      byStatus[record.status].push(record);
    });
    Object.entries(byStatus).forEach(([status, records]) => {
      const bySemester = {};
      records.forEach((record) => {
        if (!bySemester[record.semesterNumber]) bySemester[record.semesterNumber] = [];
        bySemester[record.semesterNumber].push(record);
      });
      const statusCard = U.el("article", { className: "supply-status-card" });
      statusCard.append(U.el("h3", { text: status }));
      Object.entries(bySemester).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([semNum, sems]) => {
        const rows = sems.map((r) => [r.courseCode, r.courseTitle, r.gradePoint.toFixed(1)]);
        statusCard.append(U.el("h4", { text: `Semester ${semNum}` }), U.el("div", { className: "table-scroll" }, resultTable(["Code", "Subject", "Grade"], rows)));
      });
      section.append(statusCard);
    });
    panel.replaceChildren(section);
  }

  function activate(key, focus = false) {
    state.active = key;
    tabs.querySelectorAll("[role='tab']").forEach((tab) => { const active = tab.dataset.key === key; tab.setAttribute("aria-selected", active); tab.tabIndex = active ? 0 : -1; if (active && focus) tab.focus(); });
    panel.setAttribute("aria-labelledby", `tab-${key}`);
    const documentActive = key !== "overview" && key !== "supply";
    document.querySelector("#print-button").hidden = !documentActive;
    document.querySelector("#download-button").hidden = !documentActive || !window.PORTAL_CONFIG.allowDownloads;
    if (key === "overview") renderOverview(); else if (key === "transcript") window.TranscriptRenderer.render(state, panel, documentHeader, resultTable, signature, addDocumentActions); else if (key === "supply") renderSupplyHistory(); else renderSemesterHub();
  }

  function renderTabs() {
    const items = [{ key: "overview", label: "Overview" }, { key: "semesters", label: "Semester Result Cards" }, { key: "supply", label: "Supply History" }, { key: "transcript", label: "Complete Transcript" }];
    tabs.replaceChildren();
    items.forEach((item, index) => { const button = U.el("button", { type: "button", role: "tab", id: `tab-${item.key}`, text: item.label }); button.dataset.key = item.key; button.setAttribute("aria-selected", index === 0); button.tabIndex = index === 0 ? 0 : -1; button.addEventListener("click", () => activate(item.key)); tabs.append(button); });
    tabs.addEventListener("keydown", (event) => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); const all = [...tabs.children]; let i = all.indexOf(document.activeElement); if (event.key === "Home") i = 0; else if (event.key === "End") i = all.length - 1; else i = (i + (event.key === "ArrowRight" ? 1 : -1) + all.length) % all.length; activate(all[i].dataset.key, true); });
  }

  async function init() {
    const initialParams = new URLSearchParams(location.search);
    const roll = U.normalizeRoll(initialParams.get("roll"));
    const requestedView = initialParams.get("view");
    if (!roll) return setError("Please enter your roll number on the search page.");
    if (!U.validRoll(roll)) return setError("Invalid roll number format.");
    try {
      const { data, index, supplyData } = await window.PortalData.load();
      const student = index.get(roll);
      if (!student) return setError("No result was found for this roll number. Please check the roll number and try again.");
      state.student = student; state.metadata = data.metadata; state.supplyData = supplyData;
      state.selectedSemester = student.semesters[0] ? student.semesters[0].semesterNumber : null;
      const cleanParams = new URLSearchParams({ roll: student.rollNumber });
      if (["overview", "semesters", "supply", "transcript"].includes(requestedView)) cleanParams.set("view", requestedView);
      history.replaceState(null, "", `?${cleanParams.toString()}`);
      status.hidden = true; dashboard.hidden = false;
      document.querySelector("#authorized-notice").hidden = window.PORTAL_CONFIG.publicMode || !window.PORTAL_CONFIG.showPrivacyWarning;
      renderStudentCard(); renderTabs();
      activate(["overview", "semesters", "supply", "transcript"].includes(requestedView) ? requestedView : "overview");
      document.title = `${student.rollNumber} Result | Emerson University Multan`;
      document.querySelector("#print-button").addEventListener("click", () => { const node = document.querySelector(".printable-document"); const suffix = state.active === "transcript" ? "Complete-Transcript" : `Semester-${state.selectedSemester}-Result-Card`; window.PortalPrint.print(node, `${student.rollNumber}-${suffix}.pdf`, false); });
      document.querySelector("#download-button").addEventListener("click", () => { const node = document.querySelector(".printable-document"); const suffix = state.active === "transcript" ? "Complete-Transcript" : `Semester-${state.selectedSemester}-Result-Card`; window.PortalPrint.print(node, `${student.rollNumber}-${suffix}.pdf`, true); });
    } catch (error) { console.error("Unable to load result data", error); setError("The local result dataset could not be loaded. Run this portal from a local static server and try again."); }
  }
  init();
})();
