#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import 'source-map-support/register';
import { BuildtronicsCognitoPipeline } from '../lib/buildtronics-cognito-pipeline';
import { BuildtronicsFePipeline } from '../lib/buildtronics-fePipeline-stack';

const envEuWest1 = { account: '460234074473', region: 'eu-west-1' };

const app = new cdk.App();
new BuildtronicsFePipeline(app, 'BuildtronicsFePipeline', {env: envEuWest1});
new BuildtronicsCognitoPipeline(app, 'BuildtronicsCognitoPipeline', {env: envEuWest1});