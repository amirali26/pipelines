import { BuildSpec, LinuxBuildImage, PipelineProject } from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipelineAction from '@aws-cdk/aws-codepipeline-actions';
import * as role from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

export class FrontendPipeline extends cdk.Stack {
  public s3Role: s3.Bucket;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3Bucket
    this.s3Role = new s3.Bucket(this, 'helpmycase-s3-bucekt', {
      bucketName: 'helpmycase-frontend',
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',

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

    // Codebuild
    const project = new PipelineProject(this, 'helpmycase-react-ui-codebuildproject', {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
      },
      projectName: 'helpmycase-react-ui',
      buildSpec: BuildSpec.fromSourceFilename('buildspec.yaml'),
      role: s3Role as any,
      environmentVariables: {
        DEPLOY_BUCKET: {
          value: this.s3Role.bucketName,
        },
        DISTRIBUTION: {
          value: 'E2JZVXD8021PJ2',
        }
      },
    });

    // Actions
    const gitHubAction = new codepipelineAction.GitHubSourceAction({
      actionName: 'githubSourceAction',
      owner: 'handlemycase',
      repo: 'react-ui',
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
      actionName: 'helpmycase-react-ui',
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

    // Pipeline
    new codepipeline.Pipeline(
      this,
      'helpmycase-react-ui-pipeline',
      {
        pipelineName: 'helpmycase-react-ui-pipeline',
        crossAccountKeys: false,
        stages: [sourceStage, buildStage],
      }
    );
  }
}
