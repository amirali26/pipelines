#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import 'source-map-support/register';
import { Cloudfront } from '../lib/cloudfront';
import { HandleMyCaseCognitoStack } from '../lib/cognito';
import { DashboardRegistry } from '../lib/dashboard-container-registry';
import { DashboardECSContainer } from '../lib/dashboard-containerisation';
import { DashboardDatabase } from '../lib/dashboard-database';
import { DashboardVPC } from '../lib/dashboard-vpc';
import { EmailService } from '../lib/email-services';
import { DynamoTables } from '../lib/express-setup';
import { FormContainerisation } from '../lib/form-container-registry';
import { LambdaFunctions } from '../lib/lambda-functions';
import { Pipeline } from '../lib/pipeline';
import { StorybookCodeArtifactPipeline } from '../lib/storybook-pipeline';

const envEuWest1 = { account: '460234074473', region: 'eu-west-1' };

const app = new cdk.App();

/*

  PIPELINES

*/
const feStack = new Pipeline(app, 'HandleMyCaseFePipeline', {
  bucketName: 'helpmycase-frontend',
  projectName: 'helpmycase-react-ui',
  environmentVariables: {
    DEPLOY_BUCKET: {
      value: 'helpmycase-frontend',
    },
    DISTRIBUTION: {
      value: 'E2JW4YZGPM7CG0',
    }
  },
  repo: 'react-ui',
}, { env: envEuWest1 });
const formsStack = new Pipeline(app, 'HandleMyCaseFeFormsPipeline', {
  bucketName: 'helpmycase-frontend-forms',
  projectName: 'helpmycase-forms-ui',
  environmentVariables: {
    DEPLOY_BUCKET: {
      value: 'helpmycase-frontend-forms',
    },
    DISTRIBUTION: {
      value: 'EEB6LEHZLF875',
    }
  },
  repo: 'forms-ui'
}, { env: envEuWest1 });
new Pipeline(app, 'HandleMyCaseBePipeline', {
  projectName: 'helpmycase-backend-forms',
  repo: 'forms-backend'
}, { env: envEuWest1 });
new Pipeline(app, 'HandleMyCaseDashboardBePipeline', {
  projectName: 'helpmycase-backend-dashboard',
  repo: 'dashboard',
  branch: 'main'
}, { env: envEuWest1 });
new StorybookCodeArtifactPipeline(app,'HandleMyCaseStorybookPipeline',{ env: envEuWest1 });

/*

  CLOUDFRONT DISTRIBUTIONS

*/
new Cloudfront( app, 'HandleMyCaseCloudfront-frontend', feStack.s3Role!, ['solicitor.helpmycase.co.uk'], { env: envEuWest1 });
new Cloudfront( app, 'HandleMyCaseCloudfront-forms', formsStack.s3Role!, ['forms.helpmycase.co.uk'], { env: envEuWest1 });

/*

  VPCs

*/
const dashboardVPC = new DashboardVPC(app, 'HandleMyCaseDashboardVpc', { env: envEuWest1 });

/*

  CONTAINERISATION

*/
new FormContainerisation(app, 'HandleMyCaseFormContainerisation', { env: envEuWest1 });

const dashboardRegistry = new DashboardRegistry(app, 'HandleMyCaseDashboardRegistry', { env: envEuWest1 });
const dashboardECSContainer = new DashboardECSContainer(app, 'HandleMyCaseEcsSetup', dashboardRegistry.repository, dashboardVPC.vpc, { env: envEuWest1 });
new DashboardDatabase(app, 'HandleMyCaseDashboardDatabaseSetup', dashboardVPC.vpc, dashboardECSContainer.sg, { env: envEuWest1 });

/*

  EMAIL SERVICES

*/
new EmailService(app, 'HandleMyCaseEmailService', { env: envEuWest1 });


/*

  COGNITO

*/
new HandleMyCaseCognitoStack(app, 'HandleMyCaseCognitoStack', dashboardVPC.vpc,  {env: envEuWest1});

/*

  DYNAMO

*/
const lambdaFunctions = new LambdaFunctions(app, 'HandleMyCaseLambdaFunctions', { env: envEuWest1 });
new DynamoTables(app, 'HandleMyCaseDynamoTables', lambdaFunctions.createRequestLambda, { env: envEuWest1 });