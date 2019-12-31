# geodesy-js

A lightweight library to represents a location with an easy to use API (using [unitsnet-js](https://www.npmjs.com/package/unitsnet-js) API).

Supports getting the curve between two locations and getting a distinition location baed on curve data.

> The calculation is from the greate [Geodesy](https://github.com/juergenpf/Geodesy) project.

## Install via NPM:

```bash 

npm install geodesy-js

```

## Using examples

Example with the class driven API
```typescript
import { GeoLocation } from 'geodesy-js';
import { Angle, Length } from 'unitsnet-js';

// Create a world location
const location = new GeoLocation({
    Latitude: Angle.FromDegrees(32),
    Longitude: Angle.FromDegrees(35),
});

// Get a location based on the curve from the location
const destinationLocation = location.destination(Angle.FromDegrees(10), Length.FromMeters(3000));

console.log(`The destination coordinates:`);
console.log(`Latitude: ${destinationLocation.Latitude.toString()}`); // Latitude: 32.026643406143805 °
console.log(`Longitude: ${destinationLocation.Longitude.toString()}`); // Longitude: 35.005514633016986 °


// Get the distance between the location and the destinationLocation.
const distance = location.distance(destinationLocation);
console.log(`The distance: ${distance.toString()}`); // The distance: 2999.998518387958 m


// Get the curve (distance & azimuth) between the location and the destinationLocation.
const curve = location.curve(destinationLocation);
console.log(`The curve:`);
console.log(`Distance: ${curve.Distance.toString()}`); // Distance: 2999.998518387958 m
console.log(`Azimuth: ${curve.Azimuth.toString()}`); // Azimuth: 9.999999999995072 °
```

Example with the methods driven API
```typescript

import { GeoPoint, getDestinationGeoPoint, getDistance, getGeoPointsCurve } from 'geodesy-js';
import { Angle, Length } from 'unitsnet-js';

// Create a world location
const location: GeoPoint = {
    Latitude: Angle.FromDegrees(32),
    Longitude: Angle.FromDegrees(35),
};

// Get a location based on the curve from the location
const destinationLocation = getDestinationGeoPoint(location, Angle.FromDegrees(10), Length.FromMeters(3000));

console.log(`The destination coordinates:`);
console.log(`Latitude: ${destinationLocation.Latitude.toString()}`); // Latitude: 32.026643406143805 °
console.log(`Longitude: ${destinationLocation.Longitude.toString()}`); // Longitude: 35.005514633016986 °


// Get the distance between the location and the destinationLocation.
const distance = getDistance(location, destinationLocation);
console.log(`The distance: ${distance.toString()}`); // The distance: 2999.998518387958 m


// Get the curve (distance & azimuth) between the location and the destinationLocation.
const curve = getGeoPointsCurve(location, destinationLocation);
console.log(`The curve:`);
console.log(`Distance: ${curve.Distance.toString()}`); // Distance: 2999.998518387958 m
console.log(`Azimuth: ${curve.Azimuth.toString()}`); // Azimuth: 9.999999999995072 °
```


> Currently the library supports only WGS84 datum. 
