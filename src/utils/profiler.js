/**
 * Profiler para medir performance
 */

const measurements = {};

export const startMeasure = (label) => {
  measurements[label] = {
    start: performance.now(),
    label
  };
};

export const endMeasure = (label) => {
  if (!measurements[label]) {
    console.warn(`❌ Medição ${label} não iniciada`);
    return 0;
  }

  const duration = performance.now() - measurements[label].start;
  const ms = Math.round(duration * 100) / 100;

  if (ms > 100) {
    console.warn(`⚠️  [${label}] Lento: ${ms}ms`);
  } else if (ms > 1000) {
    console.error(`❌ [${label}] MUITO LENTO: ${ms}ms`);
  } else {
    console.log(`✓ [${label}] ${ms}ms`);
  }

  delete measurements[label];
  return ms;
};

export const profile = async (label, fn) => {
  startMeasure(label);
  try {
    const result = await fn();
    endMeasure(label);
    return result;
  } catch (err) {
    endMeasure(label);
    throw err;
  }
};
