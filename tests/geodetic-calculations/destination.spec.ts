import { expect } from 'chai';
import { describe } from 'mocha';
import { Angle, Length } from 'unitsnet-js';
import { getDestinationGeoPoint } from '../../src/geodetic-calculations';
import { GeoPoint } from '../../src/models';

describe('#Destination calculator', () => {
  const geoPoint: GeoPoint = {
    Latitude: Angle.FromDegrees(32),
    Longitude: Angle.FromDegrees(35),
  };

  it('Get the correct destinition', () => {
    const destinitionGeoPoint = getDestinationGeoPoint(geoPoint, Angle.FromDegrees(10), Length.FromMeters(3000));
    expect(destinitionGeoPoint.Latitude.BaseValue).equals(32.026643406143805);
    expect(destinitionGeoPoint.Longitude.BaseValue).equals(35.005514633016986);
  });
});
