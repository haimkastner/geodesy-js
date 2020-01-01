import { Angle, Length } from 'unitsnet-js';

/** Geodetic curve information between 2 points in the world */
export declare interface GeoCurve {
  /** Distance between 2 geo positions */
  Distance: Length;
  /** Azimuth between 2 geo positions */
  Azimuth: Angle;
}
