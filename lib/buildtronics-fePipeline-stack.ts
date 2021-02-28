import { BuildSpec, PipelineProject } from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipelineAction from '@aws-cdk/aws-codepipeline-actions';
import * as role from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { Resolver } from 'dns';

export class BuildtronicsFePipeline extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3Bucket
    const siteBucket = new s3.Bucket(this, 'BuildtronicsFEProduction', {
      bucketName: 'buildtronics-fe-pipeline',
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',

      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // S3 bucket role
    const s3Role = new role.Role(this, 'S3 Role', {
        assumedBy: new role.ServicePrincipal('codebuild.amazonaws.com'),
        description: 'Role to provide access to codepipeline to s3 bucker',
    });

    s3Role.addToPolicy(new role.PolicyStatement({
        resources: ['*'],
        actions: ['*'],
    }));

    // Artifacts
    const sourceOutput = new codepipeline.Artifact();
    const sourceInputs = new codepipeline.Artifact();

    // Codebuild
    const project = new PipelineProject(this, 'BuildtronicsFE', {
      projectName: 'BuildtronicsFE',
      buildSpec: BuildSpec.fromSourceFilename('buildspec.yaml'),
      role: s3Role,
      environmentVariables: {
        DEPLOY_BUCKET: {
          value: siteBucket.bucketName,
        },
      },
    });

    // Actions
    const gitHubAction = new codepipelineAction.GitHubSourceAction({
      actionName: 'githubSourceAction',
      owner: 'buildtronics',
      repo: 'react',
      // @ts-ignore
      oauthToken: cdk.SecretValue.secretsManager(
        'arn:aws:secretsmanager:eu-west-1:460234074473:secret:github_personal_access_token-HSIOq3',
        {
          jsonField: 'value',
        }
      ),
      output: sourceOutput,
      branch: 'master',
      trigger: codepipelineAction.GitHubTrigger.WEBHOOK,
    });

    const codebuildAction = new codepipelineAction.CodeBuildAction({
      actionName: 'BuildtronicsFE',
      project: project,
      input: sourceOutput,
    });

    // Stages

    const sourceStage: codepipeline.StageProps = {
      stageName: 'Source',
      actions: [gitHubAction],
    };

    const buildStage: codepipeline.StageProps = {
      stageName: 'Build',
      actions: [codebuildAction],
    };

    const deployStage: codepipeline.StageProps = {
      stageName: 'Deploy',
      actions: [gitHubAction],
    };

    // Pipeline
    const pipeline = new codepipeline.Pipeline(
      this,
      'BuildtronicsReactFEPipeline',
      {
        pipelineName: 'BuildtronicsReactFEPipeline',
        crossAccountKeys: false,
        stages: [sourceStage, buildStage],
      }
    );
  }
}
