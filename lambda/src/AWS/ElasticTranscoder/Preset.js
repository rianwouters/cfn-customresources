'use strict';
const CustomUpdatableAWSResource = require('../CustomUpdatableAWSResource.js');

module.exports = class Preset extends CustomUpdatableAWSResource {

    constructor(req) {
        super(req, 'ElasticTranscoder');
    }

    createParams(req) {
        const params = super.createParams(req);
        if (!params.Name) params.Name = this.Name(req);
        return params;
    }

};