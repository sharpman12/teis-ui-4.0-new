export const timeArray = ['day', 'days', 'month', 'months', 'week', 'weeks', 'year', 'years', 'yr', 'yrs', 'minute', 'minutes', 'min', 'mins', 'hour', 'hours', 'hrs', 'hr'];
export const shortHandMap = {
  'yr': 'year',
  'yrs': 'yrs',
  'min': 'minute',
  'mins': 'minutes',
  'hr': 'hour',
  'hrs': 'hours'
};
export const YESTERDAY = 'yesterday';
export const TODAY = 'today';
export const ERR = {
  1: 'Do not understand timeframe, search cannot be done'
};
export const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const EDIT_EXPRESSION_INFO = 'Search Expressions \The search can be defined as one or more search expressions.  Several search expressions can be defined if separated by  &, AND, |, OR.  The search expressions are:  \[any text]                  Free text search, for example:\Invoice\TaskId: xxxx             Search on TaskId, for example:\TaskId:9459dc58-7fa9-4254-90de-5073d373a9ac\[Tag]:[Value]           Search on Tag Value, for example: \MyTag:MyValue\Status=xxx                Status search only. (Complete, Error, Active, Hold, InputHold, Done), for example:\Status=Hold\LogType=xxx           LogType search only. (Debug, Info, Warn, Error), for example:\LogType=Warn\\Example of combined expressions:\\InvoinceId:9857521\& Status=Error\\C:\Data\ParsedFile.txt \& TaskId:9459dc58-7fa9-4254-90de-5073d373a9ac\\MessageId:5864125621\| 5864125621'