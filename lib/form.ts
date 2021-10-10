import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipelineAction from '@aws-cdk/aws-codepipeline-actions';
import * as cdk from '@aws-cdk/core';
import * as role from '@aws-cdk/aws-iam';

export class FormStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const _role = new role.Role(this, 'S3 Role', {
            assumedBy: new role.ServicePrincipal('codebuild.amazonaws.com'),
            description: 'Role to provide access to codepipeline to s3 bucker',
        });

        _role.addToPolicy(new role.PolicyStatement({
            resources: ['*'],
            actions: ['*'],
        }));

        const codeBuildProject = new codebuild.PipelineProject(this, 'helpmycase-formstack-codebuildproject', {
            projectName: 'helpmycase-formcodebuild',
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yaml'),
            role: _role as any,
        });

        const sourceOutput = new codepipeline.Artifact();

        // Github source action
        const sourceAction = new codepipelineAction.GitHubSourceAction({
            actionName: 'helpmycase-formpipelinesourceaction',
            //@ts-ignore
            oauthToken: cdk.SecretValue.secretsManager(
                'arn:aws:secretsmanager:eu-west-1:460234074473:secret:github_personal_access_token-HSIOq3',
                {
                    jsonField: 'value',
                }
            ),
            owner: 'handlemycase',
            repo: 'forms-backend',
            output: sourceOutput,
            branch: 'master',
        });

        // Build phase
        const buildAction = new codepipelineAction.CodeBuildAction({
            actionName: 'helpmycase-stackbuild',
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
            'helpmycase-formpipeline',
            {
                pipelineName: 'helpmycase-formstack-pipeline',
                crossAccountKeys: false,
                stages: [sourceStage, buildStage],
            }
        );
    }
}