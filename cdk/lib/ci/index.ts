import cdk = require('@aws-cdk/core');
import { NestedStack, NestedStackProps } from '@aws-cdk/aws-cloudformation'
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import cicd = require('@aws-cdk/app-delivery');
import { BuildSpec } from '@aws-cdk/aws-codebuild';

export interface CIStage {
    output: codepipeline.Artifact
}

export interface CIStageProps {
    stageName: string,
    source: string,
    sourceStep?: number,
    actionName?: string,
    buildSpec?: string | object
}

export interface CIGithubProps {
    secretType: string,
    secret: string,
    owner: string,
    repo: string
}

export interface CISourceProps {
    artifactName?: string,
    actionName?: string,
    stageName?: string,
    sourceType: string,
    githubProps: CIGithubProps
}

export interface CIStackProps extends NestedStackProps {
    restartExecutionOnUpdate?: boolean,
    sourceArtifactName?: string,
    source: CISourceProps,
    stages: CIStageProps[]
}

export class CI extends NestedStack {
    public pipeline: codepipeline.Pipeline
    public sourceOutput: codepipeline.Artifact
    public githubSource: codepipeline_actions.GitHubSourceAction
    public stages: CIStage[]

    constructor(scope: cdk.Construct, id: string, props: CIStackProps) {
        super(scope, id, props)
        this.stages = new Array<CIStage>()
        this.createPipeline(id, props)
        this.createSource(props)
        this.createStages(id, props)
    }

    createPipeline(id: string, props: CIStackProps) {
        props.restartExecutionOnUpdate = props.restartExecutionOnUpdate || true;
        this.pipeline = new codepipeline.Pipeline(this, id + 'CodePipeline', {
            // Mutating a CodePipeline can cause the currently propagating state to be
            // "lost". Ensure we re-run the latest change through the pipeline after it's
            // been mutated so we're sure the latest state is fully deployed through.
            restartExecutionOnUpdate: props.restartExecutionOnUpdate
        })
    }

    createSource(props: CIStackProps) {
        var oauthToken
        this.sourceOutput = new codepipeline.Artifact()
        if (props.source.sourceType == "github") {
            if (props.source.githubProps.secretType == "SM") {
                oauthToken = cdk.SecretValue.secretsManager(props.source.githubProps.secret)
            } else if (props.source.githubProps.secretType == "TEXT") {
                oauthToken = cdk.SecretValue.plainText(props.source.githubProps.secret)
            } else {
                throw new Error("SM & TEXT are the only valid values for source.githubProps.secretType");
            }
            this.githubSource = new codepipeline_actions.GitHubSourceAction({
                actionName: props.source.actionName || 'github',
                output: this.sourceOutput,
                owner: props.source.githubProps.owner,
                repo: props.source.githubProps.repo,
                oauthToken: oauthToken
            });
            this.pipeline.addStage({
                stageName: props.source.stageName || 'source',
                actions: [this.githubSource]
            });
            this.stages.push({
                output: this.sourceOutput
            })
        } else {
            throw new Error("Handler for source types other than github are not implemented yet.");
        }
    }

    createStages(id: string, props: CIStackProps) {
        for (let i = 0; i < props.stages.length; i++) {
            this.createStage(id, props.stages[i])
        }
    }

    createStage(id: string, props: CIStageProps) {
        // TODO: change the code build image to be a bit more dynamic.
        var buildImage = codebuild.LinuxBuildImage.STANDARD_3_0
        var buildSpec
        if (props.buildSpec) {
            if (typeof props.buildSpec == 'string') {
                buildSpec = codebuild.BuildSpec.fromSourceFilename(props.buildSpec)
            } else {
                buildSpec = codebuild.BuildSpec.fromObject(props.buildSpec)
            }
        } else {
            buildSpec = codebuild.BuildSpec.fromSourceFilename('buildspec.yml')
        }
        
        const project = new codebuild.PipelineProject(this, `${id}CodeBuild${props.stageName}`, {
            environment: {
                buildImage: buildImage,
            },
            buildSpec
        });
        const outputArtifact = new codepipeline.Artifact();
        var inputArtifact
        var inputStage = 0
        if (props.source == "step") {
            inputStage = (props.sourceStep || 0) +1
        }
        inputArtifact = this.stages[inputStage].output
        const buildAction = new codepipeline_actions.CodeBuildAction({
            actionName: props.actionName || `action-${props.stageName}`,
            project: project,
            input: inputArtifact,
            outputs: [outputArtifact],
        });
        this.pipeline.addStage({
            stageName: props.stageName,
            actions: [buildAction],
        });
        this.stages.push({
            output: outputArtifact
        })
    }
}