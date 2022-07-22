import { SQSEvent } from 'aws-lambda';
import AWS = require('aws-sdk');
import { EmailTypes, EnquirySubmissionEmail } from './models/emailTypes';

const ses = new AWS.SES();

exports.handler = async function (event: SQSEvent) {
    let sourceEmail = "<info@helpmycase.co.uk>";
    if (!event.Records.length) throw Error('Records was empty');

    const queueInfo = event.Records[0];

    try {
        switch (queueInfo.attributes.MessageGroupId) {
            case (EmailTypes.ENQUIRY_SUBMISSION):
                sourceEmail = "Helpmycase - Enquiries " + sourceEmail;
                await sendEnquirySubmissionEmail(JSON.parse(queueInfo.body), sourceEmail);
                break;
            case (EmailTypes.FIRM_INVITATION):
                sourceEmail = "Helpmycase - Firms " + sourceEmail
                await sendAddedToFirmEmail(JSON.parse(queueInfo.body), sourceEmail);
                break;
            case (EmailTypes.REQUEST_SUBMISSION):
                sourceEmail = "Helpmycase - Requests " + sourceEmail
                await sendRequestSubmissionEmail(JSON.parse(queueInfo.body), sourceEmail);
                break;
            case (EmailTypes.FIRM_VERIFICATION):
                sourceEmail = "Helpmycase - Firms " + sourceEmail
                await sendFirmVerification(JSON.parse(queueInfo.body), sourceEmail);
                break;
            case (EmailTypes.REQUEST_CALLBACK):
                sourceEmail = "Helpmycase - Request Callback " + sourceEmail
                await requestCallbackEmail(JSON.parse(queueInfo.body), sourceEmail);
                break;
            default:
                throw Error('Invalid Message Group ID');
        }
    } catch (e) {
        console.log(e);
    } finally {
        console.log(sourceEmail, JSON.stringify(queueInfo));
    }
};

async function sendEnquirySubmissionEmail(body: EnquirySubmissionEmail, sourceEmail: string) {
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

async function sendRequestSubmissionEmail(body: EnquirySubmissionEmail, sourceEmail: string) {
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
async function requestCallbackEmail(body: EnquirySubmissionEmail, sourceEmail: string) {
    try {
        await ses.sendTemplatedEmail({
            Destination: {
                ToAddresses: [body.RequestEmail],
            },
            Source: sourceEmail,
            Template: "HelpMyCase-RequestCallback",
            TemplateData: JSON.stringify({
                solicitorResponseNumber: body.SolicitorResponseNumber,
                url: body.Url,
            })
        }).promise();
    } catch(e) {
        console.log(e);
    }
}

async function sendAddedToFirmEmail(body: EnquirySubmissionEmail, sourceEmail: string) {
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

async function sendFirmVerification(body: EnquirySubmissionEmail, sourceEmail: string) {
    await ses.sendTemplatedEmail({
        Destination: {
            ToAddresses: [body.EmailAddress],
        },
        Source: sourceEmail,
        Template: "HelpMyCase-FirmCreationVerification",
        TemplateData: JSON.stringify({
            "firm_name": body.FirmName,
            url: body.Url + "activate/firm/" + body.VerificationId,
        })
    }).promise();
}