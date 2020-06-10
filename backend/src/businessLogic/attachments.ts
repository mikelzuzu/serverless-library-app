import { AttachmentAccess } from "../dataLayer/AttachmentsAccess";


const attachmentAccess = new AttachmentAccess()

export function getAttachmentUploadUrl(isbn: string) {
    return attachmentAccess.getAttachmentUploadUrl(isbn)
}