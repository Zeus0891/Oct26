# FileObject/Attachment mapping

This note explains how shared document primitives map to Prisma schema models and documents deprecations.

## Mappings

- File metadata/storage → Prisma `FileObject`
  - Use `FileObjectBase` (shared) aligned with `FileObject` fields
  - Enums: `FileObjectStatus`, `FileCategory`, `StorageProvider`, `VirusScanStatus`
- Business attachments → Prisma `Attachment`
  - Use `AttachmentBase` (shared)
  - Enums: `AttachmentStatus`, `AttachmentType`
- Links between entities and attachments → Prisma `AttachmentLink`
  - Use `AttachmentLinkBase` (shared)
  - Enums: `AttachmentLinkStatus`, `AttachmentLinkType`

## Deprecations and aliases

- Deprecated: `DocumentBase` (old, generic document). Use `FileObjectBase` instead.
  - Temporary alias exported: `export type DocumentBase = FileObjectBase`
- Deprecated: `DocumentLinkBase`. Use `AttachmentLinkBase`.
  - Temporary alias exported: `export type DocumentLinkBase = AttachmentLinkBase`
- Deprecated: `DocumentVersionBase`. Use `AttachmentBase` with `parentAttachmentId`, `versionNumber`, and `isLatestVersion`.
  - Temporary alias exported: `export type DocumentVersionBase = AttachmentVersionBase` (shape compatible subset)

These aliases will be removed after downstream modules migrate. Update imports accordingly.
