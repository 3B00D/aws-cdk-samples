# aws-cdk-samples
A repo for CDK samples


## How i've created this.

- i'm using node v12 via nvm `nvm use v12.14.1`.
- Install cdk globally via `npm install -g aws-cdk`
- run `mkdir cdk && cd cdk`
- run `cdk init app --language typescript`

## How to run this code

- Set your default aws profile and default region (by setting AWS_PROFILE & AWS_DEFAULT_REGION variables), for example `export AWS_PROFILE=YOURLOCALPROFILE && export AWS_DEFAULT_REGION=YOURDEFAULTREGION`
- run `cd cdk`
- run `npm install`
- run `export GITHUB_TOKEN={YOURGITHUBTOKEN}`
- run `npm run build && npm run deploy`
