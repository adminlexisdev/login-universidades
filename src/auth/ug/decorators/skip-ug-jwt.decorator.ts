import { SetMetadata } from '@nestjs/common';

export const UG_PUBLIC_METADATA_KEY = 'ug:isPublic';
export const SkipUgJwtGuard = () => SetMetadata(UG_PUBLIC_METADATA_KEY, true);
