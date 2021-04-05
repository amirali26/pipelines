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

export class WorldWideAndWebStorybookCodeArtifact extends cdk.Stack {
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

    const domain = new codeartifact.CfnDomain(
      this,
      'WorldWideAndWebCodeArtifactDomain',
      {
        domainName: 'worldwideandweb',
      }
    );

    // Codebuild
    const project = new PipelineProject(this, 'WorldWideAndWebStorybook', {
      projectName: 'WorldWideAndWebStorybook',
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
      },
      role: codeartifactRole,
      buildSpec: BuildSpec.fromSourceFilename('buildspec.yaml'),
      environmentVariables: {
        
      },
    });

    // Actions
    const gitHubAction = new codepipelineAction.GitHubSourceAction({
      actionName: 'githubSourceAction',
      owner: 'worldwideandweb',
      repo: 'storybook',
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
      actionName: 'WorldWideAndWebStorybook',
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
    new codepipeline.Pipeline(this, 'WorldWideAndWebReactStorybookPipeline', {
      pipelineName: 'WorldWideAndWebReactStorybookPipeline',
      crossAccountKeys: false,
      stages: [sourceStage, buildStage],
    });
  }
}
