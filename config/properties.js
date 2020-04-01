/**
 * Application Properties defined here
 */

const config = {
    dbConnectionHost: 'mongodb://localhost:27017/',
    dbName:'social-network-db',
    collections: [],
    // geoDistance is used by GEOJSON to query posts based on user provided coords and geodistance
    geoDistance: {minDistance: 0,maxDistance: 1000},
    maxVoilationLimit: 20,
    uploadDirectory: '/demos/mwa_labs/project/social-network-webservice/public/uploads/',
    server: null
};

module.exports = config;