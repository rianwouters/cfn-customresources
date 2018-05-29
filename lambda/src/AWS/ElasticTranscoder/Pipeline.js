'use strict';
const CustomUpdatableAWSResource = require('../CustomUpdatableAWSResource.js');

module.exports = class Pipeline extends CustomUpdatableAWSResource {

    constructor() {
        super('ElasticTranscoder');
    }

    createParams(req) {
        const params = super.createParams(req);
        if (!params.Name) params.Name = this.Name(req);
        return params;
    }

};