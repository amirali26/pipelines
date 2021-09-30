import { DynamoDBStreamEvent } from "aws-lambda";
import axios from "axios";

exports.handler = async function (event: DynamoDBStreamEvent) {
    const newIds: (string | undefined)[] = event.Records.map((record) => record.dynamodb?.NewImage?.id.S)
    const filteredNewIds: string[] = newIds.filter((newId) => Boolean(newId)) as string[];

    try {
        await axios.post('http://cb09-92-6-151-14.ngrok.io', {
            query: `mutation requestSubmitted($requestId: [String]!) {
                        newRequestSubmission(requestId: $requestId)
                    }`,
            variables: {
                requestId: {
                    id: filteredNewIds
                },
            }
        });
    } catch (e) {
        console.log(e.message);
    }
};