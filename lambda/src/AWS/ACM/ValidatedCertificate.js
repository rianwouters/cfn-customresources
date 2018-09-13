'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');
const AWS = require('aws-sdk');

const delayedInvocation = lambdaArn =>
    JSON.stringify({
        StartAt: "wait",
        States: {
            wait: {
                Type: "Wait",
                Seconds: 60,
                Next: "function"
            },
            function: {
                Type: "Task",
                Resource: lambdaArn,
                End: true
            }
        }
    });

module.exports = class ValidatedCertificate extends CustomAWSResource {

    get type() {
        return "Certificate";
    }

    retryLater() {
        const sf = new AWS.StepFunctions();
        const { stateMachineArn } = process.env;
        return sf.updateStateMachine({
            stateMachineArn,
            definition: delayedInvocation(this.req.ResourceProperties.ServiceToken)
        }).promise().then(() =>
            sf.startExecution({
                stateMachineArn,
                name: Math.random().toString().slice(2),
                input: JSON.stringify(this.req)
            }).promise()
        )
    }

    create() {
        this.physicalId = `V${this.props.CertificateArn}`;
        return this.resourceMethod('describe')(this.props).then(data => {
            const cert = data.Certificate;
            const {ValidationStatus} = cert.DomainValidationOptions[0];
            console.log(ValidationStatus, JSON.stringify(cert));
            switch (ValidationStatus) {
                case 'SUCCESS': return cert;
                case 'FAILED': return Promise.reject("Certificate failed to validate");
                default: return this.retryLater().then(() => Promise.reject('DELAYED'));
            }
        });
    }

    delete() {
        return Promise.resolve({});
    }

    Create() {
        return super.Create().then(data => data[this.type]);
    }
};