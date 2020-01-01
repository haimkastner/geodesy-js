import { Angle, Length } from 'unitsnet-js';
import { getDestinationGeoPoint, getDistance, getGeoPointsCurve } from './geodetic-calculations';
import { GeoCurve } from './models/geo-curve';
import { GeoPoint } from './models/geo-point';

/**
 * A Geo localtion in the world, allows easly API to the geo-calculation.
 */
export class GeoLocation {
  /**
   * The location latitude.
   */
  public get Latitude(): Angle {
    return this.geoCoordinates.Latitude;
  }

  /**
   * The location longitude.
   */
  public get Longitude(): Angle {
    return this.geoCoordinates.Longitude;
  }

  /**
   * Create a new GeoLocation instance
   * @param geoCoordinates The position coordinates in the world.
   */
  constructor(public geoCoordinates: GeoPoint) {}

  /**
   * Get the curve (range) between current location and the given location
   * @param geoLocation The location to calculate the curve to.
   * @returns The curve info.
   */
  public curve(geoLocation: GeoLocation): GeoCurve {
    return getGeoPointsCurve(this.geoCoordinates, geoLocation.geoCoordinates);
  }

  /**
   * Get distnation from current location by direction and distance.
   * @param heading The distenation direction angle.
   * @param distance The destination distance from current location.
   * @returns The destinition location.
   */
  public destination(heading: Angle, distance: Length): GeoLocation {
    return new GeoLocation(getDestinationGeoPoint(this.geoCoordinates, heading, distance));
  }

  /**
   * Get the distnace from current location to the given location.
   * @param geoLocation The location to get the distance from.
   * @returns The distnace between th locations.
   */
  public distance(geoLocation: GeoLocation): Length {
    return getDistance(this.geoCoordinates, geoLocation.geoCoordinates);
  }
}
