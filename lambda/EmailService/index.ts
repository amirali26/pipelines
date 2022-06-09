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
        case (EmailTypes.FIRM_INVITATION):
            await sendAddedToFirmEmail(JSON.parse(queueInfo.body));
            return;
        case (EmailTypes.REQUEST_SUBMISSION):
            await sendRequestSubmissionEmail(JSON.parse(queueInfo.body));
            return;
        case (EmailTypes.FIRM_VERIFICATION):
            await sendFirmVerification(JSON.parse(queueInfo.body));
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
            url: body.Url,
        })
    }).promise();
    await ses.sendTemplatedEmail({
        Destination: {
            ToAddresses: [body.RequestEmail]
        },
        Source: sourceEmail,
        Template: "HelpMyCase-EnquiryReceived",
        TemplateData: JSON.stringify({
            email: body.RequestEmail,
            url: body.Url,
        })
    }).promise();
}

async function sendRequestSubmissionEmail(body: EnquirySubmissionEmail) {
    try {
        await ses.sendTemplatedEmail({
            Destination: {
                ToAddresses: [body.RequestEmail],
            },
            Source: sourceEmail,
            Template: "HelpMyCase-RequestSubmitted",
            TemplateData: JSON.stringify({
                name: body.Name,
                url: body.Url,
            })
        }).promise();
    } catch(e) {
        console.log(e);
    }
}

async function sendAddedToFirmEmail(body: EnquirySubmissionEmail) {
    await ses.sendTemplatedEmail({
        Destination: {
            ToAddresses: [body.EmailAddress],
        },
        Source: sourceEmail,
        Template: "HelpMyCase-AddedToFirm",
        TemplateData: JSON.stringify({
            "firm_name": body.FirmName,
            url: body.Url
        })
    }).promise();
}

async function sendFirmVerification(body: EnquirySubmissionEmail) {
    await ses.sendTemplatedEmail({
        Destination: {
            ToAddresses: [body.EmailAddress],
        },
        Source: sourceEmail,
        Template: "HelpMyCase-FirmCreationVerification",
        TemplateData: JSON.stringify({
            "firm_name": body.FirmName,
            url: body.Url + "/activate/firm/" + body.VerificationId,
        })
    }).promise();
}