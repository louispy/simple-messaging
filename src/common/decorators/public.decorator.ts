import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// By Pass Auth Guards
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
