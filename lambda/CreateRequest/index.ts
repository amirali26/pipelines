import { addNewRequestSubmission } from './services/RequestSubmissionService';

type EventType = {
    name: string,
    email: string,
    phoneNumber: string,
    case: string,
    topic: string,
    countryCode?: string,
}

exports.handler = async function (event: EventType) {
    console.log(event);
    await addNewRequestSubmission(event);
};
