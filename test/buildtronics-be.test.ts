import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as worldwideandwebBe from '../lib/worldwideandweb-be-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new worldwideandwebBe.worldwideandwebBeStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
