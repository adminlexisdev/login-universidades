import { SetMetadata } from '@nestjs/common';

export const UNIVERSITY_PUBLIC_METADATA_KEY = 'university:isPublic';
export const SkipUniversityJwtGuard = () => SetMetadata(UNIVERSITY_PUBLIC_METADATA_KEY, true);
