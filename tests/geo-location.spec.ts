import { expect } from 'chai';
import { describe } from 'mocha';
import { Angle, Length } from 'unitsnet-js';
import { GeoLocation } from '../src/geo-location';
import { getDestinationGeoPoint, getDistance, getGeoPointsCurve } from '../src/geodetic-calculations';
import { GeoPoint } from '../src/models';

describe('#GeoLocation', () => {
  const geoPoint: GeoPoint = {
    Latitude: Angle.FromDegrees(32),
    Longitude: Angle.FromDegrees(35),
  };

  const geoLocation = new GeoLocation({
    Latitude: Angle.FromDegrees(geoPoint.Latitude.Degrees),
    Longitude: Angle.FromDegrees(geoPoint.Longitude.Degrees),
  });

  let secondGeoLocation: GeoLocation;
  let secondGeoPoint: GeoPoint;

  it('Should be the same as geo point object', () => {
    expect(geoLocation.Latitude.BaseValue).equals(geoPoint.Latitude.BaseValue);
    expect(geoLocation.Longitude.BaseValue).equals(geoPoint.Longitude.BaseValue);
  });

  it('Should be the same destination as geo point calculations', () => {
    secondGeoLocation = geoLocation.destination(Angle.FromDegrees(10), Length.FromMeters(3000));
    secondGeoPoint = getDestinationGeoPoint(geoPoint, Angle.FromDegrees(10), Length.FromMeters(3000));
    expect(secondGeoLocation.Latitude.BaseValue).equals(secondGeoPoint.Latitude.BaseValue);
    expect(secondGeoLocation.Longitude.BaseValue).equals(secondGeoPoint.Longitude.BaseValue);
  });

  it('Should be the same distance as geo point calculations', () => {
    const locationsDistance = geoLocation.distance(secondGeoLocation);
    const geoPointsDistance = getDistance(geoPoint, secondGeoPoint);
    expect(locationsDistance).deep.equals(geoPointsDistance);
  });

  it('Should be the same distance as geo point calculations', () => {
    const locationsCurve = geoLocation.curve(secondGeoLocation);
    const geoPointsCurve = getGeoPointsCurve(geoPoint, secondGeoPoint);
    expect(locationsCurve).deep.equals(geoPointsCurve);
  });
});
