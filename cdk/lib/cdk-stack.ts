import * as cdk from '@aws-cdk/core';
import {CI} from './ci'

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    if (!process.env.GITHUB_TOKEN) {
      throw new Error("Please set GITHUB_TOKEN as an environment variable or use in your code secretType=SM & store your token in Secrets Manager.")
    }
    // The code that defines your stack goes here
    const cicd= new CI(this, id, {
      source: {
        artifactName: "source",
        actionName: "source",
        sourceType: "github",
        githubProps: {
          secretType: "TEXT",
          secret: process.env.GITHUB_TOKEN || "",
          owner: "3B00D",
          repo: "DevX-sls"
        }
      },
      stages: [
        {
          stageName: "test",
          source: "source",
          actionName: "test"
        }
      ]
    })
  }
}
