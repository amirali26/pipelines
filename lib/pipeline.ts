import { BuildSpec, LinuxBuildImage, PipelineProject } from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipelineAction from '@aws-cdk/aws-codepipeline-actions';
import * as role from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

type TStackInformation = {
  projectName: string,
  repo: string,
  bucketName?: string,
  environmentVariables?: Record<string, Record<string, string>>;
}
export class Pipeline extends cdk.Stack {
  public s3Role: s3.Bucket | undefined;
  constructor(scope: cdk.Construct, id: string, stackInformation: TStackInformation, props?: cdk.StackProps) {
    super(scope, id, props);


    if (stackInformation.bucketName) {
      // S3Bucket
      this.s3Role = new s3.Bucket(this, 'helpmycase-s3-bucket', {
        bucketName: stackInformation.bucketName,
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
    }

    // Artifacts
    const sourceOutput = new codepipeline.Artifact();

    // Codebuild
    const project = new PipelineProject(this, 'helpmycase-codebuildproject', {
      projectName: stackInformation.projectName,
      buildSpec: BuildSpec.fromSourceFilename('buildspec.yaml'),
      environmentVariables: stackInformation.environmentVariables as any,
      environment: {
        privileged: true,
        buildImage: LinuxBuildImage.STANDARD_5_0,
      }
    });

    project.addToRolePolicy(new role.PolicyStatement({
      actions: ['*'],
      resources: ['*'],
    }) as any);

    // Actions
    const gitHubAction = new codepipelineAction.GitHubSourceAction({
      actionName: 'githubSourceAction',
      owner: 'handlemycase',
      repo: stackInformation.repo,
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
      actionName: 'helpmycase-action-build',
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
      'helpmycase-pipeline',
      {
        pipelineName: `${stackInformation.projectName}-pipeline`,
        crossAccountKeys: false,
        stages: [sourceStage, buildStage],
      }
    );
  }
}
