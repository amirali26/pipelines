import { v4 } from 'uuid';
import { DateTime } from 'luxon';

import AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

enum RequestStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    HANDLED = 'HANDLED',
}

interface IRequestSubmissionEntity {
    id: string,
    name: string,
    phoneNumber: string,
    email: string,
    case: string,
    status: RequestStatus,
    createdDate: string,
    countryCode?: string,
    topic: string,
}

const tableName = 'HandleMyCaseDynamoTables-requestSubmissions307F0A30-1IC1PJSMU2YGA';

export const addNewRequestSubmission = async (
    newRequestSubmission: Omit<IRequestSubmissionEntity, 'id' | 'createdDate' | 'status'>
): Promise<IRequestSubmissionEntity>  => {
    const id = v4();
    const createdDate = DateTime.now().setZone('utc').toSeconds().toString();
    const result = await docClient.put({
        TableName: tableName,
        Item: {
            'id': id,
            'name': newRequestSubmission.name,
            'phoneNumber': newRequestSubmission.phoneNumber,
            'email': newRequestSubmission.email,
            'case': newRequestSubmission.case,
            'status': RequestStatus.OPEN,
            'createdDate': createdDate,
            'createdate#topic#accountId#userId': `${createdDate}#${newRequestSubmission.topic}#undefined#undefined`,
            'countryCode': newRequestSubmission.countryCode,
            'topic': newRequestSubmission.topic,
        }
    }).promise();

    if (result.$response.error) throw Error(result.$response.error.message);

    return {
        ...newRequestSubmission,
        id,
        createdDate,
        status: RequestStatus.OPEN,
    }
}

export default {
    addNewRequestSubmission
}