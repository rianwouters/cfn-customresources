'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class Certificate extends CustomAWSResource {

    constructor(req) {
        super(req, 'ACM');
    }

    requestParams() {
        return this.createParams();
    }

    describeParams() {
        return {CertificateArn: this.physicalId};
    }

    serviceCreate() {
        const request = this.serviceMethod('request');
        const describe = this.serviceMethod('describe');

        const until = (c, f) => function g(p) {
            return f(p).then(d => c(d) ? d : g(p));
        };
        const hasResourceRecord = d => d.Certificate.DomainValidationOptions.find(o => o.ValidationMethod !== "DNS" || o.ResourceRecord);

        return request().then(until(hasResourceRecord, describe));
    }

    deleteParams() {
        return {CertificateArn: this.physicalId};
    }

    response(data) {
        const cert = data.Certificate;
        return Object.assign(cert,{
            Id: cert.CertificateArn,
            ValidationRecordName: cert.DomainValidationOptions[0].ResourceRecord.Name,
            ValidationRecordValue: cert.DomainValidationOptions[0].ResourceRecord.Value,
            ValidationRecordType: cert.DomainValidationOptions[0].ResourceRecord.Type
        });
    }
};