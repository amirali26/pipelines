import * as codeartifact from '@aws-cdk/aws-codeartifact';
import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
} from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipelineAction from '@aws-cdk/aws-codepipeline-actions';
import * as role from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

export class StorybookCodeArtifactPipeline extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Artifacts
    const sourceOutput = new codepipeline.Artifact();

    // S3 bucket role
    const codeartifactRole = new role.Role(this, 'CodeArtifactRole', {
      assumedBy: new role.ServicePrincipal('codebuild.amazonaws.com'),
      description: 'Role to provide access to codepipeline to s3 bucker',
    });

    codeartifactRole.addToPolicy(
      new role.PolicyStatement({
        resources: ['*'],
        actions: ['*'],
      })
    );

    new codeartifact.CfnDomain(
      this,
      'helpmycase-codeartifact-domain',
      {
        domainName: 'helpmycase',
      }
    );

    // Codebuild
    const project = new PipelineProject(this, 'helpmycase-storybook-project', {
      projectName: 'helpmycase-storybook',
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
      },
      role: codeartifactRole as any,
      buildSpec: BuildSpec.fromSourceFilename('buildspec.yaml'),
      environmentVariables: {
        
      },
    });

    // Actions
    const gitHubAction = new codepipelineAction.GitHubSourceAction({
      actionName: 'githubSourceAction',
      owner: 'handlemycase',
      repo: 'storybook',
      // @ts-ignore
      oauthToken: cdk.SecretValue.secretsManager(
        'arn:aws:secretsmanager:eu-west-1:619680812856:secret:github_personal_access_token-VyPJnu',
        {
          jsonField: 'value',
        }
      ),
      output: sourceOutput,
      branch: 'master',
      trigger: codepipelineAction.GitHubTrigger.WEBHOOK,
    });

    const codebuildAction = new codepipelineAction.CodeBuildAction({
      actionName: 'helpmycase-storybook',
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
    new codepipeline.Pipeline(this, 'helpmycase-storybook-pipeline', {
      pipelineName: 'helpmycase-storybook-pipeline',
      crossAccountKeys: false,
      stages: [sourceStage, buildStage],
    });
  }
}
