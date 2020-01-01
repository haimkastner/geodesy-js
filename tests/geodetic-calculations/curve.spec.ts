import { expect } from 'chai';
import { describe } from 'mocha';
import { Angle } from 'unitsnet-js';
import { getDistance, getGeoPointsCurve } from '../../src/geodetic-calculations';
import { GeoPoint } from '../../src/models';

describe('#Curve calculator', () => {
  const geoPoint: GeoPoint = {
    Latitude: Angle.FromDegrees(32),
    Longitude: Angle.FromDegrees(35),
  };

  const secondPoint: GeoPoint = {
    Latitude: Angle.FromDegrees(33),
    Longitude: Angle.FromDegrees(34),
  };

  it('Get the correct geo distance', () => {
    const geoPointsDistance = getDistance(geoPoint, secondPoint);  
    expect(geoPointsDistance.Meters)
      .above(145357.85)
      .below(145357.86);
  });

  it('Get the correct geo curve', () => {
    const geoPointsDistance = getGeoPointsCurve(geoPoint, secondPoint);
    expect(geoPointsDistance.Distance.Meters)
      .above(145357.85)
      .below(145357.86);
    expect(geoPointsDistance.Azimuth.Degrees)
      .above(319.9885038)
      .below(319.98850391);
  });
});
