#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import 'source-map-support/register';
import { BackendCodeArtifact } from '../lib/backend-code-artifact';
import { HandleMyCaseClientCognito } from '../lib/client-cognito';
import { DashboardRegistry } from '../lib/client-container-registry';
import { Cloudfront } from '../lib/cloudfront';
import { HandleMyCaseCognitoStack } from '../lib/cognito';
import { ClientRegistry } from '../lib/dashboard-container-registry';
import { DashboardECSContainer } from '../lib/dashboard-containerisation';
import { DashboardDatabase } from '../lib/dashboard-database';
import { DashboardVPC } from '../lib/dashboard-vpc';
import { EmailService } from '../lib/email-services';
import { DynamoTables } from '../lib/express-setup';
import { LambdaFunctions } from '../lib/lambda-functions';
import { Pipeline } from '../lib/pipeline';
import { HandleMyCaseS3Stack } from '../lib/s3-buckets';
import { StorybookCodeArtifactPipeline } from '../lib/storybook-pipeline';


const app = new cdk.App();

/*

  S3 Buckets

*/

if (!process.env.ENV) throw Error("No environment variable has been set");
const { prefix, accountId } = app.node.tryGetContext(process.env.ENV);
const envEuWest1 = { account: accountId, region: 'eu-west-1' };
const { imageUploadBucket } = new HandleMyCaseS3Stack(app, prefix + '-HandleMyCaseS3Buckets', { env: envEuWest1 });

/*

  FE PIPELINES

*/
const feStack = new Pipeline(app, prefix + '-HandleMyCaseFePipeline', {
  bucketName: prefix + '-helpmycase-frontend',
  projectName: prefix + '-helpmycase-react-ui',
  environmentVariables: {
    DEPLOY_BUCKET: {
      value: prefix + '-helpmycase-frontend',
    },
    DISTRIBUTION: {
      value: prefix === 'dev' ? 'E943HERUWBJ2A' : 'EE9K6I5X9TIPH',
    }
  },
  repo: 'react-ui',
  branch: prefix === 'prod' ? 'master' : 'dev',
}, 'buildspec.yaml', prefix, { env: envEuWest1 });

const clientFeStack = new Pipeline(app, prefix + '-HandleMyCaseClientFePipeline', {
  bucketName: prefix + '-helpmycase-client-frontend',
  projectName: prefix + '-helpmycase-client-react-ui',
  environmentVariables: {
    DEPLOY_BUCKET: {
      value: prefix + '-helpmycase-client-frontend',
    },
    DISTRIBUTION: {
      value: prefix === 'dev' ? 'E3S9Z6RC45TIE9' : 'E3CZ8OG96X0L5Z',
    }
  },
  repo: 'clientFrontend',
  branch: prefix === 'prod' ? 'master' : 'dev',
}, 'buildspec.yaml', prefix, { env: envEuWest1 });

const formsStack = new Pipeline(app, prefix + '-HandleMyCaseFeFormsPipeline', {
  bucketName: prefix + '-helpmycase-frontend-forms',
  projectName: prefix + '-helpmycase-forms-ui',
  environmentVariables: {
    DEPLOY_BUCKET: {
      value: prefix + '-helpmycase-frontend-forms',
    },
    DISTRIBUTION: {
      value: prefix === 'dev' ? 'ET5UL5O0T2BUO' : 'E26BK3PHTUP6GL',
    }
  },
  branch: prefix === 'prod' ? 'master' : 'dev',
  repo: 'forms-ui'
}, 'buildspec.yaml', prefix, { env: envEuWest1 });
/*

  BE Pipelines PIPELINES

*/
new Pipeline(app, prefix + '-HandleMyCaseDashboardBePipeline', {
  projectName: prefix + '-helpmycase-backend-dashboard',
  repo: 'dashboard',
  branch: prefix === 'prod' ? 'master' : 'dev',
}, prefix === 'dev' ? 'dev-buildspec.yaml' : 'buildspec.yaml', prefix, { env: envEuWest1 });
new Pipeline(app, prefix + '-HandleMyCaseDashboardClientBePipeline', {
  projectName: prefix + '-helpmycase-backend-client',
  repo: 'client',
  branch: prefix === 'prod' ? 'master' : 'dev',
}, prefix === 'dev' ? 'dev-buildspec.yaml' : 'buildspec.yaml', prefix, { env: envEuWest1 });
/*

  BE Code artifact Pipelines

*/
new Pipeline(app, 'HandleMyCaseApiDatabaseModelsPipeline', {
  projectName:'helpmycase-backend-api-database-models',
  repo: 'Api.Database.Models',
  branch: prefix === 'prod' ? 'main' : 'dev',
}, 'buildspec.yaml', prefix,{ env: envEuWest1 });
new Pipeline(app, 'HandleMyCaseApiDatabaseMySqlPipeline', {
  projectName: 'helpmycase-backend-database-mysql',
  repo: 'Api.Database.MySql',
  branch: prefix === 'prod' ? 'main' : 'dev',
}, 'buildspec.yaml', prefix, { env: envEuWest1 });
/*

  Storybook pipeline

*/
new StorybookCodeArtifactPipeline(app, 'HandleMyCaseStorybookPipeline', { env: envEuWest1 });

/*

  Code Artifact backend

*/
new BackendCodeArtifact(app, 'HandleMyCaseBackendCodeArtifact', { env: envEuWest1 }); 

/*

  CLOUDFRONT DISTRIBUTIONS

*/
new Cloudfront( app, prefix + '-HandleMyCaseCloudfront-frontend', feStack.s3Role!, [`${prefix === 'dev' ? 'dev-' : ''}solicitor.helpmycase.co.uk`], { env: envEuWest1 });
new Cloudfront( app, prefix + '-HandleMyCaseCloudfront-forms', formsStack.s3Role!, [`${prefix === 'dev' ? 'dev-' : ''}forms.helpmycase.co.uk`], { env: envEuWest1 });
new Cloudfront( app, prefix + '-HandleMyCaseCloudfront-clientfrontend', clientFeStack.s3Role!, [`${prefix === 'dev' ? 'dev-' : ''}client.helpmycase.co.uk`], { env: envEuWest1 });

/*

  VPCs

*/
const dashboardVPC = new DashboardVPC(app, prefix + '-HandleMyCaseDashboardVpc', { env: envEuWest1 });

/*

  CONTAINERISATION

*/
const clientRegistry  = new ClientRegistry(app, prefix + '-HandleMyCaseClientRegistry', { env: envEuWest1 });

const dashboardRegistry = new DashboardRegistry(app, prefix + '-HandleMyCaseDashboardRegistry', { env: envEuWest1 });
const dashboardECSContainer = new DashboardECSContainer(app, prefix + '-HandleMyCaseEcsSetup', dashboardRegistry.repository, clientRegistry.repository, dashboardVPC.vpc, { env: envEuWest1 });
new DashboardDatabase(
  app,
  prefix + '-HandleMyCaseDashboardDatabaseSetup',
  dashboardVPC.vpc,
  dashboardECSContainer.sg,
  { env: envEuWest1 }
);




/*

  EMAIL SERVICES

*/
new EmailService(app, prefix + '-HandleMyCaseEmailService', { env: envEuWest1 });


/*

  COGNITO

*/
new HandleMyCaseCognitoStack(app, prefix + '-HandleMyCaseCognitoStack', dashboardVPC.vpc, prefix, {env: envEuWest1});
new HandleMyCaseClientCognito(app, prefix + '-HandleMyCaseClientCognitoStack', dashboardVPC.vpc,  {env: envEuWest1});

/*
§
  DYNAMO

*/
const lambdaFunctions = new LambdaFunctions(app, prefix + '-HandleMyCaseLambdaFunctions', imageUploadBucket, { env: envEuWest1 });
new DynamoTables(app, prefix + '-HandleMyCaseDynamoTables', lambdaFunctions.createRequestLambda, { env: envEuWest1 });