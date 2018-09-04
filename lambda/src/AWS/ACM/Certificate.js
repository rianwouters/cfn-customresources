'use strict';
const AWS = require('aws-sdk');
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class Certificate extends CustomAWSResource {

    constructor(req) {
        // TODO: make this a generic property
        if (req.ResourceProperties.Region) {
            AWS.config.region = req.ResourceProperties.Region;
            delete req.ResourceProperties.Region;
        }
        super('ACM');
    }

    //TODO refactor
    requestParams(req) {
        return super.createParams(req);
    }

    describeParams(params) {
        return params;
    }

    serviceCreate(req) {
        const request = this.serviceMethod('request');
        const describe = this.serviceMethod('describe');
        return request(req).then(describe);
    }

    deleteParams(req) {
        return {CertificateArn: req.PhysicalResourceId};
    }

    response(data) {
        const cert = data.Certificate;
        return Object.assign(cert,{Id: cert.CertificateArn});
    }
};