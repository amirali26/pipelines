import { aws_s3 as s3, aws_codepipeline as codepipeline, aws_codepipeline_actions as codepipelineAction, aws_iam as role, aws_codebuild as cb } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';


type TStackInformation = {
  projectName: string,
  repo: string,
  bucketName?: string,
  environmentVariables?: {
    [name: string]: cb.BuildEnvironmentVariable;
} | undefined;
  branch?: string
}
export class Pipeline extends cdk.Stack {
  public s3Role: s3.Bucket | undefined;
  constructor(scope: Construct, id: string, stackInformation: TStackInformation, buildspecPath: string, environment: 'dev' | 'prod', props?: cdk.StackProps) {
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
    const project = new cb.PipelineProject(this, 'helpmycase-codebuildproject', {
      projectName: stackInformation.projectName,
      buildSpec: cb.BuildSpec.fromSourceFilename(buildspecPath),
      environmentVariables: stackInformation.environmentVariables,
      environment: {
        privileged: true,
        buildImage: cb.LinuxBuildImage.STANDARD_5_0,
      }
    });

    project.addToRolePolicy(new role.PolicyStatement({
      actions: ['*'],
      resources: ['*'],
    }) );

    // Actions
    const gitHubAction = new codepipelineAction.GitHubSourceAction({
      actionName: 'githubSourceAction',
      owner: 'handlemycase',
      repo: stackInformation.repo,
      // @ts-ignore
      oauthToken: cdk.SecretValue.secretsManager(
        'arn:aws:secretsmanager:eu-west-1:619680812856:secret:github_personal_access_token-VyPJnu',
        {
          jsonField: 'value',
        }
      ),
      output: sourceOutput,
      branch: stackInformation.branch || 'master',
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
