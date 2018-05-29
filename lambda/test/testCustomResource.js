'use strict';
const CustomResource = require('../src/CustomResource');

describe('CustomResource', function () {

    describe('Request', function () {

        it("calls create on the requested resource type", function (done) {
            CustomResource.request({
                    ResourceType: 'Custom::..-test-types-TestResource',
                    RequestType: 'Create',
                    ResponseURL: 'https://localhost:8080/'
                },
                {}, () => {
                    done();
                })
        })
    })
})