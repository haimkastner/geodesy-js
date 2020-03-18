import { Angle, Length } from 'unitsnet-js';
import { GeoPoint } from '../models';
import { PRECISION, WGS84_FLATTENING, WGS84_MAJOR_AXIS, WGS84_MINOR_AXIS } from './constants';
import { isApproximatelyEqual } from './utils';

/**
 * Calculate the destination after traveling a specified distance, and a
 * specified starting bearing, for an initial location. This is the
 * solution to the direct geodetic problem.
 * @param geoPoint: starting location.
 * @param heading: starting bearing.
 * @param distance: distance to travel
 * @returns The coordinates of the final location of the traveling.
 */
export function getDestinationGeoPoint(start: GeoPoint, startBearing: Angle, distance: Length): GeoPoint {
  const majorAxis = WGS84_MAJOR_AXIS;
  const minorAxis = WGS84_MINOR_AXIS;
  const aSquared = majorAxis * majorAxis;
  const bSquared = minorAxis * minorAxis;
  const flattening = WGS84_FLATTENING;
  const phi1 = start.Latitude.Radians;
  const alpha1 = startBearing.Radians;
  const cosAlpha1 = Math.cos(alpha1);
  const sinAlpha1 = Math.sin(alpha1);
  const s = distance.Meters;
  const tanU1 = (1.0 - flattening) * Math.tan(phi1);
  const cosU1 = 1.0 / Math.sqrt(1.0 + tanU1 * tanU1);
  const sinU1 = tanU1 * cosU1;

  if (Math.sign(s) < 0) {
    throw new Error('NEGATIVE_DISTANCE');
  }

  // eq. 1
  const sigma1 = Math.atan2(tanU1, cosAlpha1);

  // eq. 2
  const sinAlpha = cosU1 * sinAlpha1;

  const sin2Alpha = sinAlpha * sinAlpha;
  const cos2Alpha = 1 - sin2Alpha;
  const uSquared = (cos2Alpha * (aSquared - bSquared)) / bSquared;

  // eq. 3
  const a = 1 + (uSquared / 16384) * (4096 + uSquared * (-768 + uSquared * (320 - 175 * uSquared)));

  // eq. 4
  const b = (uSquared / 1024) * (256 + uSquared * (-128 + uSquared * (74 - 47 * uSquared)));

  // iterate until there is a negligible change in sigma
  let sinSigma;
  let sigmaM2;
  let cosSigmaM2;
  let cos2SigmaM2;

  const sOverbA = s / (minorAxis * a);
  let sigma = sOverbA;
  let prevSigma = sOverbA;

  for (;;) {
    // eq. 5
    sigmaM2 = 2.0 * sigma1 + sigma;
    cosSigmaM2 = Math.cos(sigmaM2);
    cos2SigmaM2 = cosSigmaM2 * cosSigmaM2;
    sinSigma = Math.sin(sigma);
    const cosSignma = Math.cos(sigma);

    // eq. 6
    const deltaSigma =
      b *
      sinSigma *
      (cosSigmaM2 +
        (b / 4.0) *
          (cosSignma * (-1 + 2 * cos2SigmaM2) -
            (b / 6.0) * cosSigmaM2 * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM2)));

    // eq. 7
    sigma = sOverbA + deltaSigma;

    // break after converging to tolerance
    if (isApproximatelyEqual(sigma, prevSigma, PRECISION)) {
      break;
    }
    prevSigma = sigma;
  }

  sigmaM2 = 2.0 * sigma1 + sigma;
  cosSigmaM2 = Math.cos(sigmaM2);
  cos2SigmaM2 = cosSigmaM2 * cosSigmaM2;

  const cosSigma = Math.cos(sigma);
  sinSigma = Math.sin(sigma);

  // eq. 8
  const phi2 = Math.atan2(
    sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
    (1.0 - flattening) * Math.sqrt(sin2Alpha + Math.pow(sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1, 2.0)),
  );

  // eq. 9
  // This fixes the pole crossing defect spotted by Matt Feemster. When a path
  // passes a pole and essentially crosses a line of latitude twice - once in
  // each direction - the longitude calculation got messed up.  Using Atan2
  // instead of Atan fixes the defect.  The change is in the next 3 lines.
  // double tanLambda = sinSigma * sinAlpha1 / (cosU1 * cosSigma - sinU1*sinSigma*cosAlpha1);
  // double lambda = Math.Atan(tanLambda);
  const lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1);

  // eq. 10
  const c = (flattening / 16) * cos2Alpha * (4 + flattening * (4 - 3 * cos2Alpha));

  // eq. 11
  const l =
    lambda -
    (1 - c) * flattening * sinAlpha * (sigma + c * sinSigma * (cosSigmaM2 + c * cosSigma * (-1 + 2 * cos2SigmaM2)));

  // build results
  return {
    Latitude: Angle.FromRadians(phi2),
    Longitude: Angle.FromRadians(start.Longitude.Radians + l),
  };
}
