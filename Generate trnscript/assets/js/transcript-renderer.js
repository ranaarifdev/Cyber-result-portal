"use strict";

window.TranscriptRenderer = Object.freeze({
  render(state, panel, documentHeader, resultTable, signature, addDocumentActions) {
    const U = window.PortalUtils, student = state.student;
    const doc = U.el("article", { className: "result-document transcript-document printable-document", id: "print-document" });
    const header = documentHeader("Transcript");
    const headerText = header.querySelector("div");
    headerText.append(U.el("p", { className: "transcript-program-line", text: `${student.program} (${student.shift})  |  Session: ${student.session}` }));
    doc.append(header);
    const details = U.el("dl", { className: "transcript-details" });
    [["Name", student.name], ["Roll No.", student.rollNumber]].forEach(([a,b]) => details.append(U.definition(a,b)));
    doc.append(details);
    const grid = U.el("div", { className: "transcript-grid" });
    student.semesters.forEach((sem) => {
      const block = U.el("section", { className: "transcript-semester" });
      block.append(U.el("h4", { text: `Semester: ${["I","II","III","IV","V","VI"][sem.semesterNumber - 1]}` }));
      block.append(resultTable(["Course Code", "Course Title", "GPA"], sem.courses.map((c) => [c.courseCode, c.courseTitle, U.decimal(c.gradePoints)])));
      block.append(U.el("div", { className: "semester-totals" }, [U.el("strong", { text: `SGPA: ${U.decimal(sem.sgpa)}` }), U.el("strong", { text: `CGPA: ${U.decimal(sem.cgpa)}` })]));
      grid.append(block);
    });
    doc.append(grid);
    doc.append(U.el("div", { className: "transcript-summary" }, [U.el("span", { text: `Semesters: ${student.semesters.length}` }), U.el("span", { text: `Latest CGPA: ${U.decimal(student.overallCGPA)} / 4.00` }), U.el("span", { text: `Status: ${U.display(student.status)}` }), U.el("span", { text: `Programme: ${student.program}` })]));
    doc.append(U.el("p", { className: "legend", text: "GPA = Grade Point Average  |  CGPA = Cumulative Grade Point Average" }));
    doc.append(U.el("div", { className: "signature-row transcript-signature" }, signature("Controller of Examinations")));
    doc.append(U.el("p", { className: "document-notice", text: "Computer-generated academic record based on the provided result data. Subject to verification from the university." }));
    addDocumentActions(doc, `${student.rollNumber}-Complete-Transcript.pdf`, "Complete Transcript");
    panel.replaceChildren(doc);
  }
});
