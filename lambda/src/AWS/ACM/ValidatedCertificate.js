'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class ValidatedCertificate extends CustomAWSResource {

    get type() {
        return "Certificate";
    }

    create() {
        this.physicalId = `V${this.props.CertificateArn}`;
        return this.serviceMethod('waitFor')('certificateValidated', this.props);
    }

    delete() {
        return Promise.resolve({});
    }

    Create() {
        super.Create().then(data => data[this.type]);
    }
};