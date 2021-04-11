#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import 'source-map-support/register';
import { WorldWideAndWebStorybookCertificateManager } from '../lib/worldwideandweb-certificateManager';
import { WorldWideAndWebStorybookCloudfront } from '../lib/worldwideandweb-cloudfront';
import { worldwideandwebCognitoPipeline } from '../lib/worldwideandweb-cognito-pipeline';
import { WorldWideAndWebFePipeline } from '../lib/worldwideandweb-fePipeline-stack';
import { WorldWideAndWebStorybookCodeArtifact } from '../lib/worldwideandweb-storybookPipeline-stack';

const envEuWest1 = { account: '460234074473', region: 'eu-west-1' };
const envUsEast1 = { account: '460234074473', region: 'us-east-1' };

const app = new cdk.App();
const { s3Role } = new WorldWideAndWebFePipeline(
  app,
  'WorldWideAndWebFePipeline',
  { env: envEuWest1 }
);
new WorldWideAndWebStorybookCodeArtifact(
  app,
  'WorldWideAndWebStorybookPipeline',
  { env: envEuWest1 }
);
const { certificate } = new WorldWideAndWebStorybookCertificateManager(
  app,
  'WorldWideAndWebStorybookCertificateManager',
  {
    env: envUsEast1,
  }
);
new WorldWideAndWebStorybookCloudfront(
  app,
  'WorldWideAndWebStorybookCloudfront',
  s3Role,
  { env: envEuWest1 }
);
new worldwideandwebCognitoPipeline(app, 'WorldWideAndWebCognitoPipeline', {env: envEuWest1});
