'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');
const AWS = require('aws-sdk');

module.exports = class ValidatedCertificate extends CustomAWSResource {

    get type() {
        return "Certificate";
    }

    create() {
        this.physicalId = `V${this.props.CertificateArn}`;
        return this.serviceMethod('describe')(this.props).then(data => {
            if (data.Certificate.DomainValidationOptions.ValidationStatus === 'SUCCESS') return data.Certificate;
            if (data.Certificate.DomainValidationOptions.ValidationStatus === 'FAILED') return Promise.reject();
            return new AWS.StepFunctions().startExecution({
                stateMachineArn: process.env.DelayedFunctionCall,
                name: Math.random().toString().slice(2),
                input: JSON.stringify({
                    functionArn: this.context.invokedFunctionArn,
                    request: this.req
                })
            }).promise().then(() => Promise.reject('DELAYED'))
        });
    }

    delete() {
        return Promise.resolve({});
    }

    Create() {
        return super.Create().then(data => data[this.type]);
    }
};