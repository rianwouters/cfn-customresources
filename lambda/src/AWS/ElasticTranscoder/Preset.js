'use strict';
const CustomUpdatableAWSResource = require('../CustomUpdatableAWSResource.js');

module.exports = class Preset extends CustomUpdatableAWSResource {

    constructor(req) {
        super(req, 'ElasticTranscoder');
        if (!this.props.Name) this.props.Name = this.Name();
    }

};