const keys = require("./config/env-config");
const distance = require("google-distance-matrix");
distance.key(keys.googleDevKey);

const GeoCoding = {
  rad(x) {
    return (x * Math.PI) / 180;
  },
  haversine_distance(mk1, mk2) {
    var R = 3958.8; // Radius of the Earth in miles
    var rlat1 = mk1.position.lat() * (Math.PI / 180); // Convert degrees to radians
    var rlat2 = mk2.position.lat() * (Math.PI / 180); // Convert degrees to radians
    var difflat = rlat2 - rlat1; // Radian difference (latitudes)
    var difflon = (mk2.position.lng() - mk1.position.lng()) * (Math.PI / 180); // Radian difference (longitudes)

    var d =
      2 *
      R *
      Math.asin(
        Math.sqrt(
          Math.sin(difflat / 2) * Math.sin(difflat / 2) +
            Math.cos(rlat1) *
              Math.cos(rlat2) *
              Math.sin(difflon / 2) *
              Math.sin(difflon / 2)
        )
      );
    return d;
  },

  getDistance(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = GeoCoding.rad(p2.lat - p1.lat);
    var dLong = GeoCoding.rad(p2.lng - p1.lng);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(GeoCoding.rad(p1.lat)) *
        Math.cos(GeoCoding.rad(p2.lat)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
  },
  getMiles(i) {
    return i * 0.000621371192;
  },
  getMeters(i) {
    return i * 1609.344;
  },
  async findDistance2(p1, p2) {
  return new Promise((resolve, reject) => {
    let destinations = [`${p1.city}`, `${p1.lat},${p1.lng}`];
    let origins = [`${p2.city}`, `${p2.lat},${p2.lng}`];
    distance.matrix(origins, destinations, function(err, distances) {
      if (err) {
        return console.log(err);
      }
      if (!distances) {
        return console.log("no distances");
      }
      if (distances.status == "OK") {
        resolve(Promise.resolve(distances.rows[0].elements[0].distance))
      } else {
        return
      }
    });
  })
  }
};

module.exports = GeoCoding;
