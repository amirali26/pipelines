import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipelineAction from '@aws-cdk/aws-codepipeline-actions';
import * as cdk from '@aws-cdk/core';

export class BuildtronicsCognitoPipeline extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const pipeline = new codepipeline.Pipeline(this, 'buildtronics-cognitopipeline', {
            pipelineName: 'buildtronics-cognitopipeline',
        });

        const codeBuildProject = new codebuild.Project(this, 'buildtronics-cognito-codebuildproject', {
            buildSpec: codebuild.BuildSpec.fromSourceFilename('build/buildspec.yaml'),
        });

        const sourceOutput = new codepipeline.Artifact();

        // Github source action
        const sourceAction = new codepipelineAction.GitHubSourceAction({
            actionName: 'buildtronics-cognitopipelinesourceaction',
            //@ts-ignore
            oauthToken: cdk.SecretValue.secretsManager(
                'arn:aws:secretsmanager:eu-west-1:460234074473:secret:github_personal_access_token-HSIOq3',
                {
                    jsonField: 'value',
                }
            ),
            owner: 'buildtronics',
            repo: 'https://github.com/buildtronics/buildtronics-login',
            output: sourceOutput,
            branch: 'master',
        });

        pipeline.addStage({
            stageName: 'Github Source',
            actions: [sourceAction]
        });

        // Build phase
        const buildAction = new codepipelineAction.CodeBuildAction({
            actionName: 'buildtronics-stackbuild',
            input: sourceOutput,
            project: codeBuildProject, 
        });

        pipeline.addStage({
            stageName: 'Build source',
            actions: [buildAction]
        });
    }
}