import { MagnetInfo } from '../../types/magnet';
import { PageState, SessionState } from '../../types';

export type MessageType = 
  | 'GET_PAGE_STATE'
  | 'SAVE_PAGE_STATE'
  | 'SAVE_MAGNET'
  | 'SAVE_MAGNETS'
  | 'GET_MAGNETS'
  | 'DELETE_MAGNET'
  | 'PARSE_MAGNETS'
  | 'CLEANUP_PAGE_STATES';

export interface Message {
  type: MessageType;
  url?: string;
  state?: PageState;
  magnet?: MagnetInfo;
  data?: MagnetInfo[];
  hash?: string;
  maxAge?: number;
} 