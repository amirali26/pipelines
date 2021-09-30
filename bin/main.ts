#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import 'source-map-support/register';
import { CertificateManager } from '../lib/certificate-manager';
import { Cloudfront } from '../lib/cloudfront';
import { CognitoPipeline } from '../lib/cognito-pipeline';
import { DynamoTables } from '../lib/express-setup';
import { FrontendPipeline } from '../lib/frontend-pipeline';
import { LambdaFunctions } from '../lib/lambda-functions';
import { StorybookCodeArtifactPipeline } from '../lib/storybook-pipeline';

const envEuWest1 = { account: '460234074473', region: 'eu-west-1' };
const envUsEast1 = { account: '460234074473', region: 'us-east-1' };

const app = new cdk.App();
const { s3Role } = new FrontendPipeline(
  app,
  'HandleMyCaseFePipeline',
  { env: envEuWest1 }
);
new StorybookCodeArtifactPipeline(
  app,
  'HandleMyCaseStorybookPipeline',
  { env: envEuWest1 }
);
const { certificate } = new CertificateManager(
  app,
  'HandleMyCaseCertificateManager',
  {
    env: envUsEast1,
  }
);
new Cloudfront(
  app,
  'HandleMyCaseCloudfront',
  s3Role, 
  { env: envEuWest1 }
);
new CognitoPipeline(app, 'HandleMyCaseCognitoPipeline', { env: envEuWest1 });
const lambdaFunctions = new LambdaFunctions(app, 'HandleMyCaseLambdaFunctions', { env: envEuWest1 });
new DynamoTables(app, 'HandleMyCaseDynamoTables', lambdaFunctions.createRequestLambda, { env: envEuWest1 });