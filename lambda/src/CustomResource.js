'use strict';
const response = require('cfn-response');

module.exports = class CustomResource {

    Name({StackId, LogicalResourceId, RequestId}) {
        return `${StackId.split('/')[1].slice(-13)}-${LogicalResourceId.substr(0,13)}-${RequestId.slice(-12)}`;
    }

    static create(req) {
        const type = req.ResourceType.split('::')[1];
        const Cls = require(`./${type.replace(/-/g, '/')}.js`);
        return new Cls();
    }

    static request(req, context, callback) {
        const failed = err => {
            console.error(err);
            respond(response.FAILED, {});
        };

        const success = data => {
            console.log(JSON.stringify(data));
            respond(response.SUCCESS, data);
        };

        const respond = (status, data) => {
            response.send(req, status, data, req.PhysicalResourceId);
            callback(null);
        };

        try {
            console.log(JSON.stringify(req));
            const resource = CustomResource.create(req);
            resource[req.RequestType](req).then(success, failed);
        } catch(err) {
            failed(err);
        }
    }
};