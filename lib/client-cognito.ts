
const verifyEmail = require('../email-templates/verify-email.json');
import { aws_cognito as cognito, aws_lambda_nodejs as lambda, aws_ec2 as ec2, aws_iam as iam, Duration } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Construct } from 'constructs';
export class HandleMyCaseClientCognito extends cdk.Stack {
  constructor(scope: Construct, id: string, vpc: ec2.Vpc, props?: cdk.StackProps) {
    super(scope, id, props);

    const verifyAuthChallengeResponse = new lambda.NodejsFunction(this , 'verifyAuthChallengeResponse', {
      entry: 'lambda/VerifyAuthChallengeResponse/index.ts',
      bundling: {
        minify: true,
      },
    });

    const defineAuthChallenge = new lambda.NodejsFunction(this , 'defineAuthChallenge', {
      entry: 'lambda/DefineAuthChallenge/index.ts',
      bundling: {
        minify: true,
      },
    });
    
    const postAuthentication = new lambda.NodejsFunction(this , 'postAuthentication', {
      entry: 'lambda/PostAuthentication/index.ts',
      bundling: {
        minify: true,
      },
    });

    const preSignUp = new lambda.NodejsFunction(this , 'preSignUp', {
      entry: 'lambda/PreSignUp/index.ts',
      bundling: {
        minify: true,
      },
    });

    const createAuthChallenge = new lambda.NodejsFunction(this , 'createAuthChallenge', {
      entry: 'lambda/CreateAuthChallenge/index.ts',
      bundling: {
        minify: true,
      },
      timeout: Duration.seconds(15) ,
    });

    const createAuthChallengePolicy = new iam.PolicyStatement({
      actions: ['sns:Publish'],
      resources: ['*']
    });

    const postAuthenticationPolicy = new iam.PolicyStatement({
      actions: ['cognito-idp:AdminUpdateUserAttributes'],
      resources: ['*']
    });

    createAuthChallenge.addToRolePolicy(createAuthChallengePolicy );
    postAuthentication.addToRolePolicy(postAuthenticationPolicy );

    const _cognito = new cognito.UserPool(this, 'helpmycase-client-userpool', {
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
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        requireUppercase: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      lambdaTriggers: {
        createAuthChallenge: createAuthChallenge ,
        defineAuthChallenge: defineAuthChallenge ,
        preSignUp: preSignUp ,
        verifyAuthChallengeResponse: verifyAuthChallengeResponse ,
        postAuthentication: postAuthentication ,
      },
      standardAttributes: {
        fullname: {
          required: true,
          mutable: true,
        },
      },
    });

    _cognito.addClient('frontend-client-react', {
      preventUserExistenceErrors: true,
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
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