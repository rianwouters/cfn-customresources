'use strict';
const CustomUpdatableAWSResource = require('../CustomUpdatableAWSResource.js');

module.exports = class Certificate extends CustomUpdatableAWSResource {

    constructor() {
        super('ACM');
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