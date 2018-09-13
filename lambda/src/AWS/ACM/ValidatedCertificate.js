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

    create() {
        this.physicalId = `V${this.props.CertificateArn}`;
        return this.resourceMethod('describe')(this.props).then(data => {
            if (data.Certificate.DomainValidationOptions.ValidationStatus === 'SUCCESS') return data.Certificate;
            if (data.Certificate.DomainValidationOptions.ValidationStatus === 'FAILED') return Promise.reject();
            const sf = new AWS.StepFunctions();
            const { stateMachineArn } = process.env;
            return sf.updateStateMachine({
                stateMachineArn,
                definition: delayedInvocation(this.req.ResourceProperties.ServiceToken)
            }).promise()
                .then(data =>
                    sf.startExecution({
                        stateMachineArn,
                        name: Math.random().toString().slice(2),
                        input: JSON.stringify(this.req)
                    }).promise())
                .then(() => Promise.reject('DELAYED'))
        });
    }

    delete() {
        return Promise.resolve({});
    }

    Create() {
        return super.Create().then(data => data[this.type]);
    }
};