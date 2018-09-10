'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class Certificate extends CustomAWSResource {

    constructor(req) {
        super(req, 'ACM');
    }
    
    create() {
        return this.resourceMethod('request')(this.props);
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
        return this.create()
            .then(data => this.physicalId = data.CertificateArn)
            .then(until(hasResourceRecord, () => this.describe))
            .then(data => {
                const cert = data.Certificate;
                const resourceRecord = cert.DomainValidationOptions[0].ResourceRecord;
                return Object.assign(cert, {
                    Id: this.physicalId,
                    ValidationRecordName: resourceRecord.Name,
                    ValidationRecordValue: resourceRecord.Value,
                    ValidationRecordType: resourceRecord.Type
                });
            });
    }

};