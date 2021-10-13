import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs from '@aws-cdk/aws-ecs';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cm from '@aws-cdk/aws-certificatemanager';
import { Duration, listValidator, NestedStackProps } from '@aws-cdk/core';

export class FormECSContainer extends cdk.NestedStack {
    constructor(scope: cdk.Construct, id: string, repository: ecr.Repository, props?: NestedStackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, 'Formsbackend-vpc');
        vpc.selectSubnets({
            subnetType: ec2.SubnetType.PUBLIC,
        });

        const taskDefinition = new ecs.FargateTaskDefinition(this, 'Formsbackend-fargattaskdefinition', {
            memoryLimitMiB: 1024,
        });
        const container = taskDefinition.addContainer('FormsBackendContainer', {
            image: ecs.EcrImage.fromEcrRepository(repository as any),
        });
        container.addPortMappings({
            containerPort: 8081,
        });

        const cluster = new ecs.Cluster(this, 'FormsBackendCluster', {
            vpc: vpc as any,
        });

        const service = new ecs.FargateService(this, 'Formsbackend-service', {
            cluster,
            taskDefinition,
        });
        const lb = new elbv2.ApplicationLoadBalancer(this, 'Formsbackend-applicationloadbalancer', {
            vpc,
            internetFacing: true,
        });

        lb.addRedirect();

        const certificate = cm.Certificate.fromCertificateArn(
            this, '443 Certificate',
            'arn:aws:acm:eu-west-1:460234074473:certificate/e425bca7-a5e5-48b7-8b5f-c8ed48356e45'
        );
        const listener = lb.addListener('Formsbackend-listener', {
            open: true,
            port: 443,
            certificates: [certificate],
        });


        listener.addTargets('Formsbackend-targetgroup', {
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [service as any],
            healthCheck: {
                enabled: true,
                path: '/',
                interval: cdk.Duration.minutes(1) as any,
                timeout: Duration.seconds(30) as any,
                unhealthyThresholdCount: 10,
            }
        });
    }
}