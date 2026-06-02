var STATE_WARMUP, STATE_STAGE_1, STATE_STAGE_2, STATE_STAGE_3, STATE_STAGE_4,
  STATE_COOLDOWN, STATE_DONE, state, timeInState, maxHR,
  WARMUP_DUR, STAGE_1_DUR, STAGE_2_DUR, STAGE_3_DUR, STAGE_4_DUR, COOLDOWN_DUR,
  lt1_hr, lt1_pace, lt2_hr, lt2_pace, lt2_power, currentTemplate, uiLoaded,
  h1_hrSum, h1_spdSum, h1_count, h2_hrSum, h2_spdSum, h2_count, stage_results,
  zs_active, testModeNum, dfa_current, debugTimer, stageDurIndex, lt1_detected, lt2_detected;

function onLoad(input, output) {
  STATE_WARMUP = 0;
  STATE_STAGE_1 = 1;
  STATE_STAGE_2 = 2;
  STATE_STAGE_3 = 3;
  STATE_STAGE_4 = 4;
  STATE_COOLDOWN = 5;
  STATE_DONE = 6;

  state = STATE_WARMUP;
  timeInState = 0;
  maxHR = 190;
  currentTemplate = 't';

  stageDurIndex = 0;
  WARMUP_DUR = 60;
  STAGE_1_DUR = 60;
  STAGE_2_DUR = 60;
  STAGE_3_DUR = 60;
  STAGE_4_DUR = 30;
  COOLDOWN_DUR = 30;

  lt1_hr = 0;
  lt1_pace = 0;
  lt2_hr = 0;
  lt2_pace = 0;
  lt2_power = 0;

  h1_hrSum = 0; h1_spdSum = 0; h1_count = 0;
  h2_hrSum = 0; h2_spdSum = 0; h2_count = 0;
  stage_results = [];

  zs_active = 0;
  testModeNum = 0; // 0 = STANDARD, 1 = ADVANCED
  dfa_current = 0;
  debugTimer = 0;
  lt1_detected = false;
  lt2_detected = false;
}

function onExerciseStart(input, output) {
  state = STATE_WARMUP;
  timeInState = 0;
  currentTemplate = 't';

  h1_hrSum = 0; h1_spdSum = 0; h1_count = 0;
  h2_hrSum = 0; h2_spdSum = 0; h2_count = 0;
  stage_results = [];

  zs_active = 0;
  testModeNum = 0;
  dfa_current = 0;
  debugTimer = 0;
  stageDurIndex = 0;
  lt1_detected = false;
  lt2_detected = false;

  WARMUP_DUR = 60;
  STAGE_1_DUR = 60;
  STAGE_2_DUR = 60;
  STAGE_3_DUR = 60;
  STAGE_4_DUR = 30;
  COOLDOWN_DUR = 30;
}

function onEvent(input, output, eventId) {
  if (eventId === 1) { // 1 = Toggle page
    if (currentTemplate === 't') {
      if (state === STATE_DONE) {
        currentTemplate = 'results';
      } else {
        currentTemplate = 'debug';
      }
    } else {
      currentTemplate = 't';
    }
    debugTimer = 0;
    unload('_cm'); // Force watch to reload the UI template
  } else if (eventId === 2) { // 2 = Cycle stage duration (only in WARMUP)
    if (state === STATE_WARMUP) {
      stageDurIndex = (stageDurIndex + 1) % 3;
      if (stageDurIndex === 0) { // 1 min stages
        WARMUP_DUR = 60; STAGE_1_DUR = 60; STAGE_2_DUR = 60; STAGE_3_DUR = 60; STAGE_4_DUR = 30; COOLDOWN_DUR = 30;
      } else if (stageDurIndex === 1) { // 5 min stages
        WARMUP_DUR = 300; STAGE_1_DUR = 300; STAGE_2_DUR = 300; STAGE_3_DUR = 300; STAGE_4_DUR = 150; COOLDOWN_DUR = 150;
      } else { // 10 min stages
        WARMUP_DUR = 600; STAGE_1_DUR = 600; STAGE_2_DUR = 600; STAGE_3_DUR = 600; STAGE_4_DUR = 300; COOLDOWN_DUR = 300;
      }
      timeInState = 0; // Reset warmup time to start fresh with new duration
    }
  } else if (eventId === 3) { // 3 = Toggle Standard vs Advanced mode
    testModeNum = testModeNum === 1 ? 0 : 1;
    zs_active = testModeNum;
    unload('_cm');
  }
}

var accumulateDecoupling = function(input, stageDur) {
  var offset = stageDur > 120 ? 60 : 0;
  if (timeInState < offset) return;

  var halfPoint = offset + (stageDur - offset) / 2;

  if (timeInState < halfPoint) {
    if (input.HeartRate > 0 && input.Speed > 0) {
      h1_hrSum += input.HeartRate;
      h1_spdSum += input.Speed;
      h1_count++;
    }
  } else {
    if (input.HeartRate > 0 && input.Speed > 0) {
      h2_hrSum += input.HeartRate;
      h2_spdSum += input.Speed;
      h2_count++;
    }
  }
};

var saveStageResult = function(stageIndex) {
  var avg_hr1 = h1_count > 0 ? h1_hrSum / h1_count : 0;
  var avg_spd1 = h1_count > 0 ? h1_spdSum / h1_count : 0;
  var avg_hr2 = h2_count > 0 ? h2_hrSum / h2_count : 0;
  var avg_spd2 = h2_count > 0 ? h2_spdSum / h2_count : 0;

  var ef1 = avg_hr1 > 0 ? avg_spd1 / avg_hr1 : 0;
  var ef2 = avg_hr2 > 0 ? avg_spd2 / avg_hr2 : 0;

  var decoupling = 0;
  if (ef1 > 0) {
    decoupling = ((ef1 - ef2) / ef1) * 100;
  }

  stage_results[stage_results.length] = {
    index: stageIndex,
    dec: decoupling,
    hr: avg_hr2,
    pace: avg_spd2
  };
};

var calculateThresholds = function() {
  var foundLT1 = false;
  for (var i = 0; i < stage_results.length; i++) {
    var sr = stage_results[i];
    if (!foundLT1 && (sr.dec > 5.0 || i === 1)) {
      lt1_hr = sr.hr;
      lt1_pace = sr.pace;
      foundLT1 = true;
    }
    if (sr.dec > 10.0 || i === stage_results.length - 1) {
      lt2_hr = sr.hr;
      lt2_pace = sr.pace;
    }
  }
};

function evaluate(input, output) {
  if (state === undefined) return;

  if (currentTemplate === 'debug') {
    debugTimer++;
    if (debugTimer >= 30) {
      debugTimer = 0;
      currentTemplate = 't';
    }
  } else {
    debugTimer = 0;
  }

  var shouldAdvance = false;
  timeInState++;

  if (input.MaxHR && input.MaxHR > 0) {
    maxHR = input.MaxHR;
  }

  var targetLow = 0, targetHigh = 0;
  var stageLabel = "WARM UP";
  var stepLabel = "";
  var timeRem = 0;

  switch (state) {
    case STATE_WARMUP:
      stageLabel = "Warm Up";
      targetLow = maxHR * 0.57;
      targetHigh = maxHR * 0.64;
      stepLabel = "PRE";
      timeRem = WARMUP_DUR - timeInState;
      if (timeInState >= WARMUP_DUR) shouldAdvance = true;
      break;
    case STATE_STAGE_1:
      stageLabel = "Stable";
      targetLow = maxHR * 0.605;
      targetHigh = maxHR * 0.71;
      stepLabel = "1/4";
      timeRem = STAGE_1_DUR - timeInState;
      accumulateDecoupling(input, STAGE_1_DUR);
      if (timeInState >= STAGE_1_DUR) {
        saveStageResult(1);
        shouldAdvance = true;
      }
      break;
    case STATE_STAGE_2:
      stageLabel = "Stable";
      targetLow = maxHR * 0.673;
      targetHigh = maxHR * 0.778;
      stepLabel = "2/4";
      timeRem = STAGE_2_DUR - timeInState;
      accumulateDecoupling(input, STAGE_2_DUR);
      if (timeInState >= STAGE_2_DUR) {
        saveStageResult(2);
        shouldAdvance = true;
      }
      break;
    case STATE_STAGE_3:
      stageLabel = "Stable Stage";
      targetLow = maxHR * 0.742;
      targetHigh = maxHR * 0.847;
      stepLabel = "3/4";
      timeRem = STAGE_3_DUR - timeInState;
      accumulateDecoupling(input, STAGE_3_DUR);
      if (timeInState >= STAGE_3_DUR) {
        saveStageResult(3);
        lt2_power = (input.Power && input.Power > 0) ? input.Power : 0;
        shouldAdvance = true;
      }
      break;
    case STATE_STAGE_4:
      stageLabel = "Tapering";
      targetLow = maxHR * 0.81;
      targetHigh = maxHR * 1.0;
      stepLabel = "4/4";
      timeRem = STAGE_4_DUR - timeInState;
      accumulateDecoupling(input, STAGE_4_DUR);
      if (timeInState >= STAGE_4_DUR) {
        saveStageResult(4);
        calculateThresholds();
        shouldAdvance = true;
      }
      break;
    case STATE_COOLDOWN:
      stageLabel = "Cool Down";
      targetLow = maxHR * 0.50;
      targetHigh = maxHR * 0.64;
      stepLabel = "POST";
      timeRem = COOLDOWN_DUR - timeInState;
      if (timeInState >= COOLDOWN_DUR) {
        state = STATE_DONE;
        currentTemplate = 'results';
      }
      break;
    case STATE_DONE:
      stageLabel = "TEST DONE";
      stepLabel = "";
      timeRem = 0;
      break;
  }

  if (shouldAdvance) {
    state++;
    timeInState = 0;
    h1_hrSum = 0; h1_spdSum = 0; h1_count = 0;
    h2_hrSum = 0; h2_spdSum = 0; h2_count = 0;
  }

  // --- DFA Estimator ---
  var hrVal = (input.HeartRate && input.HeartRate > 0) ? input.HeartRate : 0;
  var hrPct = (hrVal > 0 && maxHR > 0) ? (hrVal / maxHR) : 0.6;
  var dfaProxy = 1.4 - (hrPct * 0.9);
  if (dfaProxy < 0.2) dfaProxy = 0.2;
  if (dfaProxy > 1.5) dfaProxy = 1.5;
  dfa_current = dfaProxy;

  // --- REAL-TIME THRESHOLD DETECTION (ADVANCED MODE) ---
  if (testModeNum === 1 && state >= 1 && state <= 4) {
    var currentSpeed = (input.Speed && input.Speed > 0) ? input.Speed : 0;
    if (!lt1_detected && dfa_current < 0.75) {
      lt1_hr = hrVal;
      lt1_pace = currentSpeed;
      lt1_detected = true;
    }
    if (!lt2_detected && dfa_current < 0.50) {
      lt2_hr = hrVal;
      lt2_pace = currentSpeed;
      lt2_detected = true;
    }
  }

  output.stateNum = state;
  var encodedTargets = Math.round(targetLow) * 1000 + Math.round(targetHigh);
  output.hrTargetNum = encodedTargets;
  output.timeRemaining = timeRem;

  output.lt1HR = lt1_hr * 1000 + lt2_hr;
  output.testModeNum = testModeNum;
  output.lt1Pace = lt1_pace;
  output.lt2Pace = lt2_pace;
  output.lt2Power = lt2_power;
}

function getUserInterface(input, output) {
  return {
    template: currentTemplate || 't'
  };
}

function getSummaryOutputs(input, output) {
  return [
    {
      id: 'lt1_hr',
      name: "LT1 HR",
      format: 'HeartRate_Fourdigits',
      value: lt1_hr
    },
    {
      id: 'lt1_pace',
      name: "LT1 Pace",
      format: 'Pace_Fourdigits',
      value: lt1_pace
    },
    {
      id: 'lt2_hr',
      name: "LT2 HR",
      format: 'HeartRate_Fourdigits',
      value: lt2_hr
    },
    {
      id: 'lt2_pace',
      name: "LT2 Pace",
      format: 'Pace_Fourdigits',
      value: lt2_pace
    },
    {
      id: 'lt2_power',
      name: "LT2 Power",
      format: 'Power_Fourdigits',
      value: lt2_power
    }
  ];
}
