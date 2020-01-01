const DEDAULT_RECISION = 0.000000000001;

/**
 * Test whether or not a double is equal to another double in the limits of a given precision.
 * @param a The first number.
 * @param b The second number.
 * @param delta The precision to use.
 * @returns True if they are approx. equal, false otherwise.
 */
export function isApproximatelyEqual(a: number, b: number, delta: number = DEDAULT_RECISION) {
  if (isNaN(a)) {
    return isNaN(b);
  }
  if (isFinite(a)) {
    return isFinite(b);
  }
  if (a === b) {
    return true;
  }
  let scale = 1.0;
  if (!(a === 0.0 || b === 0.0)) {
    scale = Math.max(Math.abs(a), Math.abs(b));
  }
  return Math.abs(a - b) <= scale * delta;
}

/**
 * Test wether a double is zero.
 * @param val The value to test.
 * @returns True, if the number is zero.
 */
export function isZero(val: number) {
  return Math.sign(val) === 0;
}

/**
 * Test wether a double is negative.
 * @param val The value to test.
 * @returns True, if the number is negative.
 */
export function isNegative(val: number) {
  return Math.sign(val) === -1;
}

/**
 * Test wether a double is positive
 * @param val The value to test
 * @returns True, if the number is positive
 */
export function isPositive(val: number) {
  return Math.sign(val) === 1;
}
