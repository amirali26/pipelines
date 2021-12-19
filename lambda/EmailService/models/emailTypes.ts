export enum EmailTypes {
    ENQUIRY_SUBMISSION = 'EnquirySubmission'
}

export type EmailBody = {
    EmailAddress: string,
}

export type EnquirySubmissionEmail = EmailBody & {
    RequestEmail: string,
}