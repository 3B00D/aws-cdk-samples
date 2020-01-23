import * as cdk from '@aws-cdk/core';
import Cdk = require('../lib/cdk-stack');
import '@aws-cdk/assert/jest';

let app, stack: cdk.Stack
beforeAll(() => {
  app = new cdk.App();
    // WHEN
  stack = new Cdk.CdkStack(app, 'TestStack');
});


test('Contains a nested stack', () => {
  expect(stack).toHaveResource('AWS::CloudFormation::Stack')
});