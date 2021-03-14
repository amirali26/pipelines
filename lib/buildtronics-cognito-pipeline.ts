import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipelineAction from '@aws-cdk/aws-codepipeline-actions';
import * as cdk from '@aws-cdk/core';
import * as role from '@aws-cdk/aws-iam';

export class BuildtronicsCognitoPipeline extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const _role = new role.Role(this, 'S3 Role', {
            assumedBy: new role.ServicePrincipal('codebuild.amazonaws.com'),
            description: 'Role to provide access to codepipeline to s3 bucker',
        });

        const codeBuildProject = new codebuild.PipelineProject(this, 'buildtronics-cognito-codebuildproject', {
            projectName: 'buildtronics-cognitocodebuild',
            buildSpec: codebuild.BuildSpec.fromSourceFilename('build/buildspec.yaml'),
            role: _role,
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
            repo: 'buildtronics-login',
            output: sourceOutput,
            branch: 'master',
        });

        // Build phase
        const buildAction = new codepipelineAction.CodeBuildAction({
            actionName: 'buildtronics-stackbuild',
            project: codeBuildProject,
            input: sourceOutput,
        });

        const sourceStage: codepipeline.StageProps = {
            stageName: 'Source',
            actions: [sourceAction],
        };

        const buildStage: codepipeline.StageProps = {
            stageName: 'Build',
            actions: [buildAction],
        };

        // Pipeline
        new codepipeline.Pipeline(
            this,
            'buildtronics-cognitopipeline',
            {
                pipelineName: 'buildtronics-cognito-pipeline',
                crossAccountKeys: false,
                stages: [sourceStage, buildStage],
            }
        );
    }
}