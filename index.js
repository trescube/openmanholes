'use strict';

const fs = require('fs');
const oboe = require('oboe');

let count = 0;

console.log('{"type":"FeatureCollection", "features": [');

oboe(fs.createReadStream('manholes.orig.geojson'))
  .node('features.*', (feature) => {
    feature.properties = {};
    console.log(((count++ > 0) ? ',' : '') + JSON.stringify(feature));

    return oboe.drop;

  })
  .done(() => {
    console.log(']}');
  });
