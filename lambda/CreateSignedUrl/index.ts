// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import AWS = require('aws-sdk');
import { v4 } from 'uuid';

const s3Client = new AWS.S3();
export const handler = async (event) => {
  const { contentType, type } = JSON.parse(event.body);
  const uuid = v4(); 
  const url = s3Client.createPresignedPost({
    Bucket: process.env.BUCKET_NAME,
    Conditions: [
      ["content-length-range", 0, 500000],
      ["starts-with", "$Content-Type", "image/"],
    ],
    Fields: {
      key: `${type}/${uuid}`,
      contentType,
    },
  });
    const response = {
        statusCode: 200,
      body: {
        url,
        uuid,
      },
    };
    return response;
};