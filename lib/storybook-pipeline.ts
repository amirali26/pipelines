import * as cdk from 'aws-cdk-lib';
import { aws_codebuild as cb, aws_codepipeline as codepipeline, aws_codepipeline_actions as codepipelineAction, aws_iam as role, aws_codeartifact as codeartifact } from 'aws-cdk-lib';
import { Construct } from 'constructs';


export class StorybookCodeArtifactPipeline extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
    const project = new cb.PipelineProject(this, 'helpmycase-storybook-project', {
      projectName: 'helpmycase-storybook',
      environment: {
        buildImage: cb.LinuxBuildImage.STANDARD_5_0,
      },
      role: codeartifactRole ,
      buildSpec: cb.BuildSpec.fromSourceFilename('buildspec.yaml'),
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
