'use strict';
const CustomUpdatableAWSResource = require('../CustomUpdatableAWSResource.js');

module.exports = class Preset extends CustomUpdatableAWSResource {

    constructor(req) {
        super(req, 'ElasticTranscoder');
    }

    createParams() {
        const params = super.createParams();
        if (!params.Name) params.Name = this.Name();
        return params;
    }

};