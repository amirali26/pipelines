import * as ecr from '@aws-cdk/aws-ecr';
import * as cdk from '@aws-cdk/core';
import { FormECSContainer } from './form-containerisation';

export class FormContainerisation extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const repository = new ecr.Repository(this, 'FormsBackend');

        new FormECSContainer(this, 'HandleMyCaseEcsSetup', repository);
    }
}