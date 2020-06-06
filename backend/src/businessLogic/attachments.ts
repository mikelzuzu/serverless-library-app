import { AttachmentAccess } from "../dataLayer/AttachmentsAccess";


const attachmentAccess = new AttachmentAccess()

export function getAttachmentUploadUrl(todoId: string) {
    return attachmentAccess.getAttachmentUploadUrl(todoId)
}