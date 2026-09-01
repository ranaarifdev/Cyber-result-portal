"use strict";

const ANALYTICS_THRESHOLDS = Object.freeze({
  excellent: 90,
  good: 80,
  satisfactory: 65,
  minimumRankingRecords: 10,
  minimumPrivacyRecords: 5
});

window.ANALYTICS_THRESHOLDS = ANALYTICS_THRESHOLDS;

const SUBJECT_PASS_RULE = Object.freeze({
  minimumPassingGradePoint: 2.0,
  zeroMeansFailure: true,
  excludeCoursePrefixes: ["MZ"]
});

const PUBLIC_SUPPLY_LIST_ENABLED = true;

window.SUBJECT_PASS_RULE = SUBJECT_PASS_RULE;
window.PUBLIC_SUPPLY_LIST_ENABLED = PUBLIC_SUPPLY_LIST_ENABLED;
