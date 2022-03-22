export interface GoogleAuthRefreshToken {
  refreshToken: string;
}
export interface CalendarEventPayload {
  end: DateTimeType;
  start: DateTimeType;
  anyoneCanAddSelf?: boolean;
  attachments?: { fileUrl: string }[];
  attendees?: Attendees[];
  colorId?: string;
  conferenceData?: any;
  description?: string;
  extendedProperties?: { private?: any; shared?: any }[];
  gadget?: Gadget[];
  guestsCanInviteOthers?: boolean;
  guestsCanModify?: boolean;
  guestsCanSeeOtherGuests?: boolean;
  id?: string;
  location?: string;
  originalStartTime?: DateTimeType[];
  recurrence?: any[];
  reminders?: Reminders;
  sequence?: number;
  source?: { title: string; url: string };
  status?: 'confirmed' | 'tentative' | 'cancelled';
  summary?: string;
  transparency?: 'opaque' | 'transparent';
  visibility?: 'default' | 'public' | 'private' | 'confidential';
}

export interface Reminders {
  overrides: { minutes: number }[];
  useDefault: boolean;
}

export interface Gadget {
  display: 'icon' | 'chip';
  height?: number;
  iconLink: string;
  link: string;
  preferences: any;
  title: string;
  type: string;
  width?: number;
}

export interface Attendees {
  additionalGuests?: number;
  comment?: string;
  displayName?: string;
  email: string;
  optional?: boolean;
  resource?: boolean;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
}

export interface DateTimeType {
  date?: string;
  dateTime?: string;
  // For recurring events time zone should be mentioned
  timeZone?: string;
}

export interface UpdateReminders {
  overrides: { minutes: number; method: 'email' | 'popup' }[];
  useDefault: boolean;
}

export interface CalendarEventUpdatePayload
  extends Omit<CalendarEventPayload, 'id' | 'reminders'> {
  attendeesOmitted?: boolean;
  reminders?: UpdateReminders;
}
