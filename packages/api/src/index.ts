export * from './ApiClient';
export * from './AuthClient';
export * from './tenant';
export * from './report';
export * from './user';
export * from './learner';
export * from './course';
export * from './tenant-library';
export * from './campaign';
export * from './group';
export * from './enrollment';
export * from './certificate';
export * from './notification';

import { apiClient } from './ApiClient';
import { AuthClient } from './AuthClient';

export const authApi = new AuthClient(apiClient);
export { apiClient };
