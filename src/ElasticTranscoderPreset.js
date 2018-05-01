'use strict';
const CustomUpdatableAWSResource = require('./CustomUpdatableAWSResource.js');
const AWS = require('aws-sdk');
const et = new AWS.ElasticTranscoder();

module.exports = class ElasticTranscoderPreset extends CustomUpdatableAWSResource {

    createParams(req) {
        const params = super.createParams(req);
        if (!params.Name) params.Name = this.Name(req);
        return params;
    }

};