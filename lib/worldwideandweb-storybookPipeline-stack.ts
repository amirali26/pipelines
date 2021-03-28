import { BuildSpec, PipelineProject } from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipelineAction from '@aws-cdk/aws-codepipeline-actions';
import * as cdk from '@aws-cdk/core';
import * as codeartifact from '@aws-cdk/aws-codeartifact';

export class WorldWideAndWebStorybookCodeArtifact extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Artifacts
    const sourceOutput = new codepipeline.Artifact();

    const repository = new codeartifact.CfnRepository(
      this,
      'WorldWideAndWebCodeArtifactRepository',
      {
        domainName: 'worldwideandweb',
        repositoryName: 'worldwideandweb-storybook',
        description:
          'Repository for the storybook components for the worldwideandweb react project',
        upstreams: ['npm-store'],
      }
    );

    // Codebuild
    const project = new PipelineProject(this, 'WorldWideAndWebStorybook', {
      projectName: 'WorldWideAndWebStorybook',
      buildSpec: BuildSpec.fromSourceFilename('buildspec.yaml'),
      environmentVariables: {},
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
