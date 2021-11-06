import * as cognito from '@aws-cdk/aws-cognito';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
export class HandleMyCaseCognitoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const postConfirmationTrigger = new lambda.NodejsFunction(this as any, 'postConfirmationTrigger', {
      entry: 'lambda/postConfirmationTrigger/index.ts',
      bundling: {
        minify: true,
      },
    });

    const _cognito = new cognito.UserPool(this, 'helpmycase-userpool', {
      userPoolName: 'helpmycase-userpool',
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'HelpMyCase - Please verify your email',
        emailBody: 'Hello {username}, Thanks for signing up for a HelpMyCase account. To continue, please verify your email address using the following code: Your verification code is {####} ',
        emailStyle: cognito.VerificationEmailStyle.CODE,
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
      }
    });

    const client = _cognito.addClient('frontend-client-react', {
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
  }
}