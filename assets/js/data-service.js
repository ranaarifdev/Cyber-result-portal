"use strict";

window.PortalData = Object.freeze({
  async load() {
    const [studentResponse, supplyResponse] = await Promise.all([
      fetch("../assets/data/students.json", { cache: "no-store" }),
      fetch("../assets/data/supply-records.json", { cache: "no-store" })
    ]);
    if (!studentResponse.ok) throw new Error(`Student dataset request failed (${studentResponse.status})`);
    if (!supplyResponse.ok) throw new Error(`Supply records request failed (${supplyResponse.status})`);
    const data = await studentResponse.json();
    const supplyData = await supplyResponse.json();
    if (!data || !Array.isArray(data.students) || !data.metadata) throw new Error("Dataset structure is invalid");
    if (!supplyData || !Array.isArray(supplyData.records)) throw new Error("Supply records structure is invalid");
    const index = new Map();
    data.students.forEach((student) => {
      const roll = window.PortalUtils.normalizeRoll(student && student.rollNumber);
      if (roll && !index.has(roll)) index.set(roll, student);
    });
    return { data, index, supplyData };
  }
});
