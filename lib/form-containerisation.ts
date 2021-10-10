import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs from '@aws-cdk/aws-ecs';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export class FormContainerisation extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, 'Formsbackend-vpc');
        vpc.selectSubnets({
            subnetType: ec2.SubnetType.PUBLIC,
        });


        const repository = new ecr.Repository(this, 'FormsBackend');

        const cluster = new ecs.Cluster(this, 'FormsBackendCluster', {
            vpc: vpc as any
        });

        const taskDefinition = new ecs.FargateTaskDefinition(this, 'Formsbackend-fargattaskdefinition');
        const container = taskDefinition.addContainer('FormsBackendContainer', {
            image: ecs.EcrImage.fromEcrRepository(repository as any),
        });

        container.addPortMappings({
            containerPort: 8081,
        });

        const lb = new elbv2.ApplicationLoadBalancer(this, 'Formsbackend-applicationloadbalancer', {
            vpc,
            internetFacing: true,
        });

        const service = new ecs.FargateService(this, 'Formsbackend-service', {
            cluster,
            taskDefinition,
        });

        const listener = lb.addListener('listener', {
            port: 80,
        });

        listener.addTargets('Formsbackend-lbtarget', {
            port: 80,
            targets: [service as any]
        });

    }
}