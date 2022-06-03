
const verifyEmail = require('../email-templates/verify-email.json');
import { aws_secretsmanager as secretsmanager, aws_ec2 as ec2, aws_lambda_nodejs as lambda, aws_cognito as cognito  } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class HandleMyCaseCognitoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, vpc: ec2.Vpc,  sg: ec2.SecurityGroup, prefix: 'dev' | 'prod', props?: cdk.StackProps) {
    super(scope, id, props);

    const secret = secretsmanager.Secret.fromSecretCompleteArn(this, 'DatabaseSecret', prefix === 'dev' ? 'arn:aws:secretsmanager:eu-west-1:619680812856:secret:devHandleMyCaseDashboardDat-YcDXj7J0CAlm-fw4vyl' : 'arn:aws:secretsmanager:eu-west-1:619680812856:secret:prodHandleMyCaseDashboardDa-VOnQoDBOvG7m-LUpOAm');
    const postConfirmationTrigger = new lambda.NodejsFunction(this , 'postConfirmationTrigger', {
      entry: 'lambda/PostConfirmationTrigger/index.ts',
      bundling: {
        minify: true,
      },
      environment: {
        NODE_ENV: prefix,
        HOST: secret.secretValueFromJson("host").toString(),
        PASSWORD: secret.secretValueFromJson("password").toString(),
      },
      vpc: vpc ,
      vpcSubnets: {
        subnets: [vpc.isolatedSubnets[0] ]
      },
      securityGroups: [sg ],
    });

    const _cognito = new cognito.UserPool(this, 'helpmycase-userpool', {
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: verifyEmail.Template.SubjectPart,
        emailBody: verifyEmail.Template.HtmlPart,
        emailStyle: cognito.VerificationEmailStyle.CODE,
        smsMessage: 'Your Helpmycase code is {####}. Never share this code with anybody.'
      },
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      signInCaseSensitive: false,
      mfa: cognito.Mfa.REQUIRED,
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        requireUppercase: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      lambdaTriggers: {
        postConfirmation: postConfirmationTrigger ,
      },
      standardAttributes: {
        fullname: {
          required: true,
          mutable: true,
        },
        birthdate: {
          required: true,
          mutable: true,
        }
      },
    });

    _cognito.addClient('frontend-client-react', {
      preventUserExistenceErrors: true,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.PROFILE, cognito.OAuthScope.OPENID],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO
      ],
    });

    const cognitoCfn = _cognito.node.defaultChild as cognito.CfnUserPool;
    cognitoCfn.emailConfiguration = {
      emailSendingAccount: 'DEVELOPER',
      sourceArn: 'arn:aws:ses:eu-west-1:619680812856:identity/info@helpmycase.co.uk',
      from: 'info@helpmycase.co.uk',
      replyToEmailAddress: 'info@helpmycase.co.uk'
    }
  }
}