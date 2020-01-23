import * as cdk from '@aws-cdk/core';
import {CI} from '../../lib/ci';
import Cdk = require('../../lib/cdk-stack');
import '@aws-cdk/assert/jest';

let app, parent: cdk.Stack, stack: cdk.Stack

beforeAll(() => {
  app = new cdk.App()
  parent = new Cdk.CdkStack(app, 'TestStack');
  stack = new CI(parent, 'CIStack', {
    source: {
      artifactName: "source",
      actionName: "source",
      sourceType: "github",
      githubProps: {
        secretType: "TEXT",
        secret: "GITHUB_TOKEN",
        owner: "OWNERNAME",
        repo: "REPONAME"
      }
    },
    stages: [
      {
        stageName: "STAGENAME",
        source: "source",
        actionName: "ACTIONNAME"
      }
    ]
  })
});


test('Create stages from configuration', () => {
  expect(stack).toHaveResource('AWS::CodePipeline::Pipeline')
});
