import { SQSEvent } from 'aws-lambda';
import AWS = require('aws-sdk');
import { EmailTypes, EnquirySubmissionEmail } from './models/emailTypes';

const ses = new AWS.SES();
const sourceEmail = "info@helpmycase.co.uk";

exports.handler = async function (event: SQSEvent) {
    if (!event.Records.length) throw Error('Records was empty');

    const queueInfo = event.Records[0];

    console.log(JSON.stringify(queueInfo));

    switch (queueInfo.attributes.MessageGroupId) {
        case (EmailTypes.ENQUIRY_SUBMISSION):
            await sendEnquirySubmissionEmail(JSON.parse(queueInfo.body));
            return;
        default:
            throw Error('Invalid Message Group ID');
    }
};

async function sendEnquirySubmissionEmail(body: EnquirySubmissionEmail) {
    await ses.sendTemplatedEmail({
        Destination: {
            ToAddresses: [body.EmailAddress],
        },
        Source: sourceEmail,
        Template: "HelpMyCase-EnquirySubmitted",
        TemplateData: JSON.stringify({
            email: body.RequestEmail,
        })
    }).promise();
}