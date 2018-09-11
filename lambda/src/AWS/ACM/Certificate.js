'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class Certificate extends CustomAWSResource {

    constructor(req) {
        super(req);
        this.service.createCertificate = this.service.requestCertificate;
    }

    delete() {
        return this.resourceMethod('delete')({CertificateArn: this.physicalId});
    }

    describe() {
        return this.resourceMethod('describe')({CertificateArn: this.physicalId});
    }

    Create() {
        const until = (c, f) => function g() {
            return f().then(d => c(d) ? d : g());
        };
        const hasResourceRecord = d => d.Certificate.DomainValidationOptions.find(o => o.ValidationMethod !== "DNS" || o.ResourceRecord);
        return super.Create()
            .then(until(hasResourceRecord, () => this.describe))
            .then(data => data[this.type])
            .then(data => {
                const resourceRecord = data.DomainValidationOptions[0].ResourceRecord;
                return Object.assign(data, {
                    ValidationRecordName: resourceRecord.Name,
                    ValidationRecordValue: resourceRecord.Value,
                    ValidationRecordType: resourceRecord.Type
                });
            });
    }

    getPhysicalId(data) {
        return data.CertificateArn;
    }
};