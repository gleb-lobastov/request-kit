/* eslint-disable no-unused-vars */
export enum READY_STATE {
  UNSENT = 0,
  OPENED = 1,
  HEADERS_RECEIVED = 2,
  LOADING = 3,
  DONE = 4,
}
/* eslint-enable no-unused-vars */

export const EMPTY_STATE = {
  readyState: READY_STATE.UNSENT,
  isError: false,
  isValid: true,
};
