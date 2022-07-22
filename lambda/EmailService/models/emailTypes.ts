export enum EmailTypes {
    ENQUIRY_SUBMISSION = 'EnquirySubmission',
    FIRM_INVITATION = 'FirmInvitation',
    REQUEST_SUBMISSION = 'RequestSubmission',
    FIRM_VERIFICATION = 'FirmVerification',
    REQUEST_CALLBACK = 'RequestCallback',
}

export type EmailBody = {
    EmailAddress: string,
}

export type EnquirySubmissionEmail = EmailBody & {
    RequestEmail: string,
} & Record<string, unknown>