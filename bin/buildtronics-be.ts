#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BuildtronicsBeStack } from '../lib/buildtronics-be-stack';

const app = new cdk.App();
new BuildtronicsBeStack(app, 'BuildtronicsBeStack');
