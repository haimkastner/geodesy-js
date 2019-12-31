import { GeoPoint } from "../models";
import { WGS84_MAGOR_AXIS, WGS84_MINOR_AXIS, WGS84_FLATTENING, PRECISION, TWO_PI } from "./constants";
import { Angle, Length } from "unitsnet-js";
import { isZero, isNegative } from "./utils";
import { GeoCurve } from "../models/geo-curve";

/**
 * Calculate the geodetic curve between two points in the world.
 * This is the solution to the inverse geodetic problem.
 * @param start starting coordinates
 * @param end ending coordinates
 * @param calculateBearing Is bearing data needed.
 */
function calculateCurve(start: GeoPoint, end: GeoPoint, calculateBearing: boolean): GeoCurve | Length {
    //
    // All equation numbers refer back to Vincenty's publication:
    // See http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf
    //

    // get constants
    const majorAxis = WGS84_MAGOR_AXIS;
    const minorAxis = WGS84_MINOR_AXIS;
    const flattening = WGS84_FLATTENING;

    // get parameters as radians
    const phi1 = start.Latitude.Radians;
    const lambda1 = start.Longitude.Radians;
    const phi2 = end.Latitude.Radians;
    const lambda2 = end.Longitude.Radians;

    // calculations
    const a2 = majorAxis * majorAxis;
    const b2 = minorAxis * minorAxis;
    const squaredRatio = (a2 - b2) / b2;

    const omega = lambda2 - lambda1;

    const tanphi1 = Math.tan(phi1);
    const tanU1 = (1.0 - flattening) * tanphi1;
    const u1 = Math.atan(tanU1);
    const sinU1 = Math.sin(u1);
    const cosU1 = Math.cos(u1);

    const tanphi2 = Math.tan(phi2);
    const tanU2 = (1.0 - flattening) * tanphi2;
    const u2 = Math.atan(tanU2);
    const sinU2 = Math.sin(u2);
    const cosU2 = Math.cos(u2);

    const sinU1SinU2 = sinU1 * sinU2;
    const cosU1SinU2 = cosU1 * sinU2;
    const sinU1CosU2 = sinU1 * cosU2;
    const cosU1CosU2 = cosU1 * cosU2;

    // eq. 13
    let lambda = omega;

    // intermediates we'll need to compute 's'
    let a = 0.0;
    let sigma = 0.0;
    let deltasigma = 0.0;
    let converged = false;

    for (let i = 0; i < 20; i++) {
        const lambda0 = lambda;
        let b = 0.0;

        const sinlambda = Math.sin(lambda);
        const coslambda = Math.cos(lambda);

        // eq. 14
        const sin2Sigma = (cosU2 * sinlambda * cosU2 * sinlambda) +
            Math.pow(cosU1SinU2 - sinU1CosU2 * coslambda, 2.0);
        const sinsigma = Math.sqrt(sin2Sigma);

        // eq. 15
        const cossigma = sinU1SinU2 + (cosU1CosU2 * coslambda);

        // eq. 16
        sigma = Math.atan2(sinsigma, cossigma);

        // eq. 17    Careful!  sin2sigma might be almost 0!
        const sinalpha = isZero(sin2Sigma) ? 0.0 : cosU1CosU2 * sinlambda / sinsigma;
        const alpha = Math.asin(sinalpha);
        const cosalpha = Math.cos(alpha);
        const cos2Alpha = cosalpha * cosalpha;

        // eq. 18    Careful!  cos2alpha might be almost 0!
        const cos2Sigmam = isZero(cos2Alpha) ? 0.0 : cossigma - 2 * sinU1SinU2 / cos2Alpha;
        const u3 = cos2Alpha * squaredRatio;

        const cos2Sigmam2 = cos2Sigmam * cos2Sigmam;

        // eq. 3
        a = 1.0 + u3 / 16384 * (4096 + u3 * (-768 + u3 * (320 - 175 * u3)));

        // eq. 4
        b = u3 / 1024 * (256 + u3 * (-128 + u3 * (74 - 47 * u3)));

        // eq. 6
        deltasigma = b * sinsigma * (cos2Sigmam + b / 4 *
            (cossigma * (-1 + 2 * cos2Sigmam2) - b / 6 * cos2Sigmam *
                (-3 + 4 * sin2Sigma) * (-3 + 4 * cos2Sigmam2)));

        // eq. 10
        const c = flattening / 16 * cos2Alpha * (4 + flattening * (4 - 3 * cos2Alpha));

        // eq. 11 (modified)
        lambda = omega + (1 - c) * flattening * sinalpha *
            (sigma + c * sinsigma * (cos2Sigmam + c * cossigma * (-1 + 2 * cos2Sigmam2)));

        // see how much improvement we got
        const change = Math.abs((lambda - lambda0) / lambda);

        if ((i > 1) && (change < PRECISION)) {
            converged = true;
            break;
        }
    }

    // eq. 19
    const s = minorAxis * a * (sigma - deltasigma);

    if (!calculateBearing) {
        return Length.FromMeters(s);
    }

    let alpha1: Angle;

    // didn't converge?  must be N/S
    if (!converged) {
        if (phi1 > phi2) {
            alpha1 = Angle.FromDegrees(180);
        }
        else if (phi1 < phi2) {
            alpha1 = Angle.FromDegrees(0);
        }
        else {
            throw new Error('INVALID N/S ANGLE, the phi1 === phi2');
        }
    }

    // else, it converged, so do the math
    else {
        // eq. 20
        let radians = Math.atan2(cosU2 * Math.sin(lambda), (cosU1SinU2 - sinU1CosU2 * Math.cos(lambda)));
        if (isNegative(radians)) radians += TWO_PI;
        alpha1 = Angle.FromRadians(radians);
    }

    if (alpha1.Degrees >= 360.0) alpha1 = Angle.FromDegrees(alpha1.Degrees - 360.0);

    return {
        Azimuth: alpha1,
        Distance: Length.FromMeters(s),
    };
}

/**
 * Calculate the geodetic curve between two points in the world.
 * @param start starting coordinates
 * @param end ending coordinates
 * @returns The distance between the points
 */
export function getDistance(start: GeoPoint, end: GeoPoint): Length {
    return calculateCurve(start, end, false) as Length;
}

/**
 * Calculate the geodetic curve between two points in the world.
 * This is the solution to the inverse geodetic problem.
 * @param start starting coordinates
 * @param end ending coordinates
 * @returns The geodetic curve information to get from start to end
 */
export function getGeoPointsCurve(start: GeoPoint, end: GeoPoint): GeoCurve {
    return calculateCurve(start, end, true) as GeoCurve;
}
