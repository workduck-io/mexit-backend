export type RegistrationStatus = 'PROGRESS' | 'SUCCESS' | 'ERROR';

export interface UserProperties {
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface UserMetadata {
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface UserPreference {
  id: string;
  workspaceId: string;
  preference: any;
}

export interface User {
  id: string;
  name: string;
  alias: string;
  status?: RegistrationStatus;
  properties?: UserProperties;
  picture?: string;
  metadata?: UserMetadata;
  email?: string;
  linkedinURL?: string;
}
