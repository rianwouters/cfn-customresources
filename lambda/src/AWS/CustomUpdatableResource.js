'use strict';
const CustomAWSResource = require('./CustomAWSResource.js');

module.exports = class CustomUpdatableAWSResource extends CustomAWSResource {

    updateParams(req) {
        const params = this.createParams(req);
        params.Id = req.PhysicalResourceId;
        return params;
    }

    Update(req) {
        const update = this.serviceMethod('update');
        return update(req).then(data => this.response(data));
    }

};