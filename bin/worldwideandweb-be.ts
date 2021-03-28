#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import 'source-map-support/register';
import { WorldWideAndWebFePipeline } from '../lib/worldwideandweb-fePipeline-stack';

const envEuWest1 = { account: '460234074473', region: 'eu-west-1' };

const app = new cdk.App();
new WorldWideAndWebFePipeline(app, 'WorldWideAndWebFePipeline', {env: envEuWest1});
// new worldwideandwebCognitoPipeline(app, 'WorldWideAndWebCognitoPipeline', {env: envEuWest1});