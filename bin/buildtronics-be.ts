#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BuildtronicsBeStack } from '../lib/buildtronics-be-stack';
import { BuildtronicsFePipeline } from '../lib/buildtronics-fePipeline-stack';

const envEuWest1 = { account: '460234074473', region: 'eu-west-1' };

const app = new cdk.App();
new BuildtronicsBeStack(app, 'BuildtronicsBeStack', { env: envEuWest1 });
new BuildtronicsFePipeline(app, 'BuildtronicsFePipeline', {env: envEuWest1});