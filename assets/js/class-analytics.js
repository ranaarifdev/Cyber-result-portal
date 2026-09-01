"use strict";

(() => {
  const section = document.querySelector("#class-analytics");
  if (!section) return;
  const status = document.querySelector("#analytics-status");
  const content = document.querySelector("#analytics-content");
  let analytics = null;
  let supplyData = null;
  let supplyViewMode = "subject";
  let mzRecords = [];

  const el = (tag, options = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(options).forEach(([key, value]) => {
      if (key === "text") node.textContent = value;
      else if (key === "className") node.className = value;
      else node.setAttribute(key, value);
    });
    (Array.isArray(children) ? children : [children]).filter(Boolean).forEach((child) => node.append(child));
    return node;
  };
  const number = (value, suffix = "") => value === null || value === undefined ? "N/A" : `${Number(value).toFixed(2)}${suffix}`;
  const privateValue = (value, records) => records < window.ANALYTICS_THRESHOLDS.minimumPrivacyRecords ? "Insufficient Data" : String(value);
  const performanceClass = (label) => `performance ${String(label).toLowerCase().replace(/\s+/g, "-")}`;

  function stat(label, value, note = "") {
    return el("article", { className: "analytics-stat" }, [el("span", { text: label }), el("strong", { text: String(value) }), note ? el("small", { text: note }) : null]);
  }

  function renderSummary() {
    const m = analytics.metadata, o = analytics.overall;
    const best = analytics.semesters.find((item) => item.semesterNumber === o.highestPerformingSemester);
    const lowest = analytics.semesters.find((item) => item.semesterNumber === o.lowestPerformingSemester);
    const target = document.querySelector("#analytics-summary");
    target.replaceChildren(
      stat("Total students", m.totalStudents), stat("Semester records", m.totalSemesterRecords),
      stat("Complete students", m.completeStudents, "All six semesters"), stat("Incomplete students", m.incompleteStudents),
      stat("Passed semester records", o.passedRecords), stat("Failed/supply/dropped", o.failedRecords),
      stat("Unknown records", o.unknownRecords), stat("Weighted pass percentage", number(o.overallPassPercentage, "%")),
      stat("Class average SGPA", number(o.averageSGPA)), stat("Highest-performing semester", best.semesterTitle, `${number(best.passPercentage, "%")} passed`),
      stat("Lowest-performing semester", lowest.semesterTitle, `${number(lowest.passPercentage, "%")} passed`), stat("Last data update", m.generatedAt)
    );
  }

  function renderSemesterCards() {
    const target = document.querySelector("#semester-analytics-cards");
    analytics.semesters.forEach((item) => {
      const dl = el("dl");
      const rows = [
        ["Valid records", `${item.validRecords} of ${item.totalClassStudents}`], ["Missing records", item.missingRecords],
        ["Passed", privateValue(item.passedRecords, item.validRecords)], ["Failed/supply/dropped", privateValue(item.failedRecords, item.validRecords)],
        ["Unknown", privateValue(item.unknownRecords, item.validRecords)], ["Pass percentage", item.validRecords < window.ANALYTICS_THRESHOLDS.minimumPrivacyRecords ? "Insufficient Data" : number(item.passPercentage, "%")],
        ["Fail percentage", item.validRecords < window.ANALYTICS_THRESHOLDS.minimumPrivacyRecords ? "Insufficient Data" : number(item.failPercentage, "%")],
        ["Average SGPA", number(item.averageSGPA)], ["Highest / lowest", `${number(item.highestSGPA)} / ${number(item.lowestSGPA)}`],
        ["Average CGPA", number(item.averageCGPA)]
      ];
      rows.forEach(([label, value]) => dl.append(el("dt", { text: label }), el("dd", { text: String(value) })));
      dl.append(el("dt", { text: "Performance" }), el("dd", {}, el("span", { className: performanceClass(item.performance), text: item.performance })));
      target.append(el("article", { className: "semester-analytics-card" }, [el("h4", { text: item.semesterTitle }), dl]));
    });
  }

  function simpleTable(headers, rows) {
    const table = el("table");
    const headerRow = el("tr");
    headers.forEach((header) => headerRow.append(el("th", { scope: "col", text: header })));
    const body = el("tbody");
    rows.forEach((row) => { const tr = el("tr"); row.forEach((cell) => tr.append(el("td", { text: String(cell) }))); body.append(tr); });
    table.append(el("thead", {}, headerRow), body); return table;
  }

  function renderChart(targetId, tableId, valueKey, maxValue, valueSuffix, extraLabel, dataset = analytics.semesters) {
    const target = document.querySelector(targetId), tableTarget = document.querySelector(tableId);
    dataset.forEach((item) => {
      const value = item[valueKey];
      const bar = el("div", { className: "analytics-bar" });
      bar.style.height = `${value === null ? 0 : Math.max(2, value / maxValue * 100)}%`;
      target.append(el("div", { className: "analytics-bar-item" }, [
        el("strong", { text: number(value, valueSuffix) }), bar, el("span", { text: `S${item.semesterNumber}` }),
        extraLabel ? el("small", { text: extraLabel(item) }) : null
      ]));
    });
    const supplyMode = valueKey === "studentsWithSupply";
    const headers = supplyMode ? ["Semester", "Supply students", "Supply subjects", "Affected percentage"] : valueKey === "passPercentage" ? ["Semester", "Pass percentage"] : ["Semester", "Average SGPA", "Valid SGPA records", "Change"];
    const rows = dataset.map((item) => supplyMode ? [`Semester ${item.semesterNumber}`, item.studentsWithSupply, item.totalSupplySubjects, number(item.affectedPercentage, "%")] : valueKey === "passPercentage"
      ? [item.semesterTitle, number(item.passPercentage, "%")]
      : [item.semesterTitle, number(item.averageSGPA), item.validSGPARecords, item.changeFromPreviousSGPA === null ? "—" : `${item.changeFromPreviousSGPA > 0 ? "+" : ""}${number(item.changeFromPreviousSGPA)}`]);
    tableTarget.append(simpleTable(headers, rows));
  }

  function subjectCard(item, improvement = false) {
    return el("article", { className: "subject-card" }, [el("h4", { text: `${item.courseCode} · ${item.courseTitle}` }), el("p", { text: `Semester ${item.semesterNumber} · ${item.validRecords} valid records` }), el("p", { text: `Passed ${item.passedRecords} · Supply ${item.supplyRecords} · Pass ${number(item.passPercentage, "%")}` }), improvement ? el("p", { text: `Supply ${number(item.supplyPercentage, "%")} · Average GP ${number(item.averageGradePoint)}` }) : el("p", { text: `Average GP ${number(item.averageGradePoint)} · ${item.performance}` })]);
  }

  function renderSubjectAnalytics() {
    analytics.strongPerformingSubjects.forEach((item) => document.querySelector("#strong-subjects").append(subjectCard(item)));
    analytics.subjectsNeedingImprovement.forEach((item) => document.querySelector("#improvement-subjects").append(subjectCard(item, true)));
    const rows = analytics.subjectAnalytics.map((item) => [item.semesterNumber, item.courseCode, item.courseTitle, item.validRecords, item.passedRecords, item.supplyRecords, item.unknownRecords, number(item.passPercentage, "%"), number(item.supplyPercentage, "%"), number(item.averageGradePoint), item.performance]);
    document.querySelector("#subject-analytics-table").append(simpleTable(["Semester", "Code", "Title", "Valid", "Passed", "Supply", "Unknown", "Pass %", "Supply %", "Average GP", "Performance"], rows));
    analytics.subjectsWithHighestSupplyCounts.forEach((item) => document.querySelector("#highest-supply-subjects").append(el("article", { className: "subject-card" }, [el("h4", { text: `${item.courseCode} · ${item.courseTitle}` }), el("p", { text: `Semester ${item.semesterNumber} · ${item.supplyRecords} verified supply subject${item.supplyRecords === 1 ? "" : "s"} in the approved cohort` })])));
  }

  function renderSupplySummary() {
    const s = analytics.supplySummary;
    document.querySelector("#supply-summary-cards").replaceChildren(stat("Total Students Analysed", s.totalStudentsAnalysed), stat("Students with Supplies", s.studentsWithSupply), stat("Total Supply Subjects", s.totalSupplySubjectRecords), stat("Semester with Most Supplies", `Semester ${s.semesterWithMostSupplies}`));
    renderChart("#supply-chart", "#supply-chart-table", "studentsWithSupply", s.totalStudentsAnalysed, "", (item) => `${item.totalSupplySubjects} subjects · ${number(item.affectedPercentage, "%")} affected`, analytics.semesterSupplySummary);
  }

  function renderMZParticipants() {
    const mz = analytics.mzParticipants;
    if (!mz || !mz.summary || !Array.isArray(mz.records)) return;
    document.querySelector("#mz-summary").replaceChildren(
      stat("Total Participants", mz.summary.totalParticipants, `${mz.summary.totalEnrollments} MZ enrollment records`),
      stat("Passed Count", mz.summary.passedCount, "MZ course results"),
      stat("Failed Count", mz.summary.failedSupplyCount, "MZ course results")
    );
    mzRecords = [...mz.records];
    renderMZTable();
  }

  function renderMZTable() {
    const query = document.querySelector("#mz-search").value.trim().toLowerCase();
    const sortBy = document.querySelector("#mz-sort").value;
    const records = mzRecords.filter((record) => !query || [record.studentName, record.rollNumber, record.courseCode, record.courseTitle, record.resultStatus].some((value) => String(value).toLowerCase().includes(query)));
    const compareText = (a, b, key) => String(a[key]).localeCompare(String(b[key]));
    records.sort((a, b) => sortBy === "name" ? compareText(a, b, "studentName") || a.semesterNumber - b.semesterNumber : sortBy === "subject" ? compareText(a, b, "courseCode") || compareText(a, b, "rollNumber") : sortBy === "result" ? compareText(a, b, "resultStatus") || compareText(a, b, "rollNumber") : sortBy === "cgpa" ? (Number(b.cgpa) - Number(a.cgpa)) || compareText(a, b, "rollNumber") : compareText(a, b, "rollNumber") || a.semesterNumber - b.semesterNumber);
    const rows = records.map((record) => [record.studentName, record.rollNumber, `${record.courseCode} — ${record.courseTitle}`, `${record.resultStatus} (${number(record.gradePoint)})`, number(record.cgpa)]);
    document.querySelector("#mz-record-count").textContent = `${records.length} MZ enrollment record${records.length === 1 ? "" : "s"} shown`;
    document.querySelector("#mz-participants-table").replaceChildren(simpleTable(["Student Name", "Roll Number", "MZ Subject", "Result (Pass/Fail/Grade)", "CGPA"], rows));
  }

  function printMZ(isDownload) {
    document.body.classList.add("printing-mz");
    const oldTitle = document.title; document.title = "MZ-Zero-Math-Participants";
    const restore = () => { document.body.classList.remove("printing-mz"); document.title = oldTitle; window.removeEventListener("afterprint", restore); };
    window.addEventListener("afterprint", restore);
    if (isDownload) window.alert('In the print dialog, select "Save as PDF" to download the MZ participant list.');
    window.print(); window.setTimeout(restore, 60000);
  }

  function bindMZActions() {
    document.querySelector("#mz-search").addEventListener("input", renderMZTable);
    document.querySelector("#mz-sort").addEventListener("change", renderMZTable);
    document.querySelector("#mz-print").addEventListener("click", () => printMZ(false));
    document.querySelector("#mz-download").addEventListener("click", () => printMZ(true));
  }

  function renderCoverage() {
    const target = document.querySelector("#analytics-coverage");
    const grid = el("div", { className: "coverage-grid" });
    analytics.semesters.forEach((item) => grid.append(el("div", { className: "coverage-item" }, [el("strong", { text: item.semesterTitle }), el("span", { text: `${item.validRecords} records · ${item.missingRecords} missing` })])));
    grid.append(el("div", { className: "coverage-item" }, [el("strong", { text: "Complete students" }), el("span", { text: String(analytics.metadata.completeStudents) })]));
    grid.append(el("div", { className: "coverage-item" }, [el("strong", { text: "Incomplete students" }), el("span", { text: String(analytics.metadata.incompleteStudents) })]));
    grid.append(el("div", { className: "coverage-item" }, [el("strong", { text: "Total semester records" }), el("span", { text: String(analytics.metadata.totalSemesterRecords) })]));
    target.append(grid);
  }

  function renderSemesterTable(sortBy = "semester") {
    const items = [...analytics.semesters];
    if (sortBy === "pass") items.sort((a, b) => b.passPercentage - a.passPercentage || a.semesterNumber - b.semesterNumber);
    else if (sortBy === "sgpa") items.sort((a, b) => b.averageSGPA - a.averageSGPA || a.semesterNumber - b.semesterNumber);
    else items.sort((a, b) => a.semesterNumber - b.semesterNumber);
    const rows = items.map((item) => [item.semesterTitle, item.validRecords, item.missingRecords, item.passedRecords, item.failedRecords, item.unknownRecords, number(item.passPercentage, "%"), number(item.averageSGPA), number(item.highestSGPA), number(item.lowestSGPA), item.performance]);
    document.querySelector("#semester-analytics-table").replaceChildren(simpleTable(["Semester", "Valid Records", "Missing Records", "Passed", "Failed/Supply", "Unknown", "Pass Percentage", "Average SGPA", "Highest SGPA", "Lowest SGPA", "Performance"], rows));
  }

  function filteredSupplyRecords() {
    if (!supplyData) return [];
    const name = document.querySelector("#supply-name-search").value.trim().toLowerCase();
    const roll = document.querySelector("#supply-roll-search").value.trim().toLowerCase();
    const subject = document.querySelector("#supply-subject-search").value.trim().toLowerCase();
    const code = document.querySelector("#supply-code-search").value.trim().toLowerCase();
    const semester = document.querySelector("#supply-semester-filter").value;
    const selectedSubject = document.querySelector("#supply-subject-filter").value;
    return supplyData.records.filter((record) => (!name || record.studentName.toLowerCase().includes(name)) && (!roll || record.rollNumber.toLowerCase().includes(roll)) && (!subject || record.courseTitle.toLowerCase().includes(subject)) && (!code || record.courseCode.toLowerCase().includes(code)) && (semester === "all" || String(record.semesterNumber) === semester) && (selectedSubject === "all" || record.courseCode === selectedSubject));
  }

  function supplyTable(records) {
    return simpleTable(["Sr. No.", "Student Name", "Roll Number", "Semester", "Subject Code", "Subject Name", "Supply/Fail Status"], records.map((record, index) => [index + 1, record.studentName, record.rollNumber, `Semester ${record.semesterNumber}`, record.courseCode, record.courseTitle, record.status]));
  }

  function renderSupplyRecords() {
    const target = document.querySelector("#supply-records-view"); target.replaceChildren();
    const records = filteredSupplyRecords();
    if (!records.length) { target.append(el("p", { className: "unavailable-note", text: "No supply records match the selected filters." })); return; }
    if (supplyViewMode === "student") {
      const groups = new Map();
      records.forEach((record) => { const key = record.rollNumber; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(record); });
      groups.forEach((items) => { const details = el("details", { className: "analytics-panel supply-student-group" }); details.append(el("summary", { text: `${items[0].studentName} — ${items[0].rollNumber} — ${items.length} supply subject${items.length === 1 ? "" : "s"}` }), el("div", { className: "panel-body table-scroll" }, supplyTable(items))); target.append(details); });
      return;
    }
    [...new Set(records.map((record) => record.semesterNumber))].sort().forEach((semesterNumber) => {
      const semesterRecords = records.filter((record) => record.semesterNumber === semesterNumber);
      const summary = analytics.semesterSupplySummary.find((item) => item.semesterNumber === semesterNumber);
      const details = el("details", { className: "analytics-panel supply-semester-panel" }); details.open = document.querySelector("#supply-semester-filter").value !== "all";
      details.append(el("summary", { text: `Semester ${semesterNumber} — ${summary.studentsWithSupply} students, ${summary.totalSupplySubjects} supply subjects` }), el("div", { className: "panel-body table-scroll" }, supplyTable(semesterRecords))); target.append(details);
    });
  }

  async function unlockSupplyRecords() {
    if (!window.PUBLIC_SUPPLY_LIST_ENABLED) {
      document.querySelector("#supply-consent").replaceChildren(el("p", { className: "unavailable-note", text: "The public identifiable supply list is disabled. Aggregate statistics remain available." })); return;
    }
    try {
      const response = await fetch("assets/data/supply-records.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Supply data request failed (${response.status})`);
      supplyData = await response.json();
      const semesterSelect = document.querySelector("#supply-semester-filter");
      for (let number = 1; number <= 6; number += 1) semesterSelect.append(el("option", { value: number, text: `Semester ${number}` }));
      const subjectSelect = document.querySelector("#supply-subject-filter");
      [...new Map(supplyData.records.map((record) => [record.courseCode, record])).values()].sort((a, b) => a.courseCode.localeCompare(b.courseCode)).forEach((record) => subjectSelect.append(el("option", { value: record.courseCode, text: `${record.courseCode} — ${record.courseTitle}` })));
      document.querySelector("#supply-consent").hidden = true; document.querySelector("#supply-content").hidden = false;
      renderSupplyRecords();
    } catch (error) { console.error("Unable to load supply records", error); document.querySelector("#supply-consent").append(el("p", { className: "unavailable-note", text: "Supply details could not be loaded." })); }
  }

  function printSupply(isDownload) {
    const semester = document.querySelector("#supply-semester-filter");
    if (semester.value === "all") semester.value = "1";
    supplyViewMode = "subject"; renderSupplyRecords();
    document.body.classList.add("printing-supply");
    const oldTitle = document.title; document.title = `Semester-${semester.value}-Supply-Report`;
    const restore = () => { document.body.classList.remove("printing-supply"); document.title = oldTitle; window.removeEventListener("afterprint", restore); };
    window.addEventListener("afterprint", restore);
    if (isDownload) window.alert('In the print dialog, select "Save as PDF" to download the supply report.');
    window.print(); window.setTimeout(restore, 60000);
  }

  function bindSupplyActions() {
    document.querySelector("#supply-continue").addEventListener("click", unlockSupplyRecords);
    document.querySelector("#supply-cancel").addEventListener("click", () => { document.querySelector("#supply-details-panel").open = false; });
    document.querySelector("#view-by-student").addEventListener("click", () => { supplyViewMode = "student"; renderSupplyRecords(); });
    document.querySelector("#view-by-subject").addEventListener("click", () => { supplyViewMode = "subject"; renderSupplyRecords(); });
    ["#supply-name-search", "#supply-roll-search", "#supply-subject-search", "#supply-code-search"].forEach((selector) => document.querySelector(selector).addEventListener("input", renderSupplyRecords));
    ["#supply-semester-filter", "#supply-subject-filter"].forEach((selector) => document.querySelector(selector).addEventListener("change", renderSupplyRecords));
    document.querySelector("#supply-clear").addEventListener("click", () => { ["#supply-name-search", "#supply-roll-search", "#supply-subject-search", "#supply-code-search"].forEach((selector) => { document.querySelector(selector).value = ""; }); document.querySelector("#supply-semester-filter").value = "all"; document.querySelector("#supply-subject-filter").value = "all"; renderSupplyRecords(); });
    document.querySelector("#supply-print").addEventListener("click", () => printSupply(false));
    document.querySelector("#supply-download").addEventListener("click", () => printSupply(true));
  }

  function renderMethodology() {
    const target = document.querySelector("#methodology-content");
    const sections = [
      ["Valid and missing records", "A valid record is an official student-semester row. A missing row is reported separately and never counted as a failure."],
      ["Classification", "Promoted, Pass, and Passed are Passed. Official status containing Fail, Supply, Supplementary, Dropped, or Probation is Failed/Supply/Dropped. Missing or unrecognized status is Unknown; GPA is not used to infer status."],
      ["Semester percentage", "Passed semester records ÷ total valid semester records × 100. Missing records are excluded and percentages use two decimal places."],
      ["Overall weighted percentage", `${analytics.overall.passedRecords} passed records ÷ ${analytics.overall.classifiedRecords} classified records × 100 = ${number(analytics.overall.overallPassPercentage, "%")}. It is not an average of semester percentages.`],
      ["Minimum thresholds", `Subject ranking requires at least ${window.ANALYTICS_THRESHOLDS.minimumRankingRecords} valid records. Aggregate detail is suppressed for groups below ${window.ANALYTICS_THRESHOLDS.minimumPrivacyRecords} records.`],
      ["Limitations", "Marks, credit hours, letter grades, quality points, and explicit course-level status are unavailable. Subject outcomes are therefore derived only from the verified final grade-point field and the published 2.0 passing threshold."],
      ["Subject grade-point rule", "The verified final course grade-point values are either 0.0 or 2.0–4.0. Grade point 2.0 or higher is Passed; 0.0 is Supply/non-passed. MZ Zero Mathematics is excluded because it does not contribute to SGPA."],
      ["Analysis cohorts", `${analytics.activeStudents} students with all six semester rows are analysed for subject performance. Supply History is calculated separately and exclusively from the approved ${analytics.supplySummary.totalStudentsAnalysed}-student roll-number cohort.`],
      ["Source conflicts", `${analytics.metadata.conflictCount} workbook/PDF numeric conflict rows are documented. The verified workbook values are used consistently.`],
      ["Privacy", "Class, semester, and subject analytics are aggregate. The MZ participant panel is the only identified analytics table and contains names, roll numbers, enrollments, and grade-point-derived MZ outcomes requested for authorized use."]
    ];
    sections.forEach(([heading, text]) => target.append(el("section", {}, [el("h3", { text: heading }), el("p", { text })])));
  }

  function preparePrint(isDownload) {
    const details = [...section.querySelectorAll("details")];
    const states = details.map((item) => item.open); details.forEach((item) => { item.open = true; });
    document.body.classList.add("printing-analytics");
    const oldTitle = document.title; document.title = "Emerson-University-Class-Result-Analytics";
    const restore = () => { document.title = oldTitle; document.body.classList.remove("printing-analytics"); details.forEach((item, index) => { item.open = states[index]; }); window.removeEventListener("afterprint", restore); };
    window.addEventListener("afterprint", restore);
    if (isDownload) window.alert('In the print dialog, select "Save as PDF" to download the class summary.');
    window.print(); window.setTimeout(restore, 60000);
  }

  function bindActions() {
    const dialog = document.querySelector("#methodology-dialog");
    const open = () => dialog.showModal();
    document.querySelector("#analytics-methodology").addEventListener("click", open);
    document.querySelector("#analytics-methodology-bottom").addEventListener("click", open);
    document.querySelector("#methodology-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    document.querySelector("#analytics-print").addEventListener("click", () => preparePrint(false));
    document.querySelector("#analytics-download").addEventListener("click", () => preparePrint(true));
    window.addEventListener("beforeprint", () => {
      section.querySelectorAll("details").forEach((item) => {
        if (!item.hasAttribute("data-print-open")) item.setAttribute("data-print-open", item.open ? "true" : "false");
        item.open = true;
      });
      document.body.classList.add("printing-analytics");
    });
    window.addEventListener("afterprint", () => {
      section.querySelectorAll("details[data-print-open]").forEach((item) => {
        item.open = item.getAttribute("data-print-open") === "true";
        item.removeAttribute("data-print-open");
      });
      document.body.classList.remove("printing-analytics");
    });
  }

  async function init() {
    try {
      const response = await fetch("assets/data/class-analytics.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Analytics request failed (${response.status})`);
      analytics = await response.json();
      if (!analytics || !Array.isArray(analytics.semesters) || analytics.semesters.length !== 6) throw new Error("Analytics structure is invalid");
      renderSummary(); renderSemesterCards();
      renderChart("#pass-chart", "#pass-chart-table", "passPercentage", 100, "%");
      renderChart("#sgpa-chart", "#sgpa-chart-table", "averageSGPA", 4, "", (item) => `${item.validSGPARecords} records · ${item.changeFromPreviousSGPA === null ? "No prior" : `${item.changeFromPreviousSGPA > 0 ? "+" : ""}${number(item.changeFromPreviousSGPA)}`}`);
      renderSubjectAnalytics(); renderSupplySummary(); renderMZParticipants(); renderCoverage(); renderMethodology(); bindActions(); bindSupplyActions(); bindMZActions();
      status.hidden = true; content.hidden = false;
    } catch (error) {
      console.error("Unable to load class analytics", error);
      status.replaceChildren(el("h3", { text: "Class analytics unavailable" }), el("p", { text: "The generated aggregate analytics file could not be loaded. Individual result search is still available." }));
    }
  }
  init();
})();
