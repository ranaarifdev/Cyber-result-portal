"use strict";

window.PortalData = Object.freeze({
  async load() {
    const response = await fetch("../assets/data/students.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Dataset request failed (${response.status})`);
    const data = await response.json();
    if (!data || !Array.isArray(data.students) || !data.metadata) throw new Error("Dataset structure is invalid");
    const index = new Map();
    data.students.forEach((student) => {
      const roll = window.PortalUtils.normalizeRoll(student && student.rollNumber);
      if (roll && !index.has(roll)) index.set(roll, student);
    });
    return { data, index };
  }
});
