
const verifyEmail = require('../email-templates/verify-email.json');
import * as cognito from '@aws-cdk/aws-cognito';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
export class HandleMyCaseCognitoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, props?: cdk.StackProps) {
    super(scope, id, props);

    const postConfirmationTrigger = new lambda.NodejsFunction(this as any, 'postConfirmationTrigger', {
      entry: 'lambda/PostConfirmationTrigger/index.ts',
      bundling: {
        minify: true,
      },
      vpc: vpc as any,
      vpcSubnets: {
        subnets: [vpc.isolatedSubnets[0] as any]
      },
    });

    const _cognito = new cognito.UserPool(this, 'helpmycase-userpool', {
      userPoolName: 'helpmycase-userpool',
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
        postConfirmation: postConfirmationTrigger as any,
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
        callbackUrls: ['http://localhost:3000'],
        logoutUrls: ['http://localhost:3000'],
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