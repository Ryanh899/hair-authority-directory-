const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo'
});


var distance = require('google-distance');
distance.apiKey = 'AIzaSyBzwFcR1tSuszjACQkI67oXrQevIpBIuFo';


const GeoCoding = {
  rad(x) {
    return x * Math.PI / 180;
  },
  haversine_distance(mk1, mk2) {
    var R = 3958.8; // Radius of the Earth in miles
    var rlat1 = mk1.position.lat() * (Math.PI / 180); // Convert degrees to radians
    var rlat2 = mk2.position.lat() * (Math.PI / 180); // Convert degrees to radians
    var difflat = rlat2 - rlat1; // Radian difference (latitudes)
    var difflon = (mk2.position.lng() - mk1.position.lng()) * (Math.PI / 180); // Radian difference (longitudes)

    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
    return d;
  },

  getDistance(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = GeoCoding.rad(p2.lat - p1.lat);
    var dLong = GeoCoding.rad(p2.lng - p1.lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(GeoCoding.rad(p1.lat)) * Math.cos(GeoCoding.rad(p2.lat)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
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
  findDistance(p1, p2) {
    return new Promise((resolve, reject) => {
      if (p1 === null || p2 === null) {
        reject('no location given')
      } else {
        distance.get({
          index: 1,
          origin: `${p1.lat}, ${p1.lng}`,
          destination: `${p2.lat}, ${p2.lng}`
        },
        function (err, data) {
          if (err) return console.log(err);
          const km = data.distance.split(' ')[0]
          resolve(km)
        });
      }
    })

  }
}

module.exports = GeoCoding;