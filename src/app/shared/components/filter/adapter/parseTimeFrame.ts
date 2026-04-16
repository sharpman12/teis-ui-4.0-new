import * as moment from 'moment';
import * as constant from '../constants/constant';
export class ParseTimeFrame  {
  displayString: string
    constructor(time) {
      const parsedDateValue = this.parseDate(time);
      this.calculateDisplayDate(time , parsedDateValue);      
    }
    parseDate(val: string) {
        const dateStr = val.replace(/\s+/g,'').trim().toLowerCase();
        let myMoment: moment.Moment = moment(dateStr, [ 'YYYY-MM-DD', `${constant.TIME_FORMAT}`, `${constant.TIME_FORMAT}-${constant.TIME_FORMAT}`], true);
        let isValidDate = myMoment.isValid() ? myMoment.toLocaleString() : false;
     
        if(isValidDate) return isValidDate;
        if(dateStr === 'now') {
        let myMoment: moment.Moment = moment();
        return myMoment.format(constant.TIME_FORMAT);
        }
        else if(dateStr.startsWith('last')) {
        const regex = new RegExp(/(last)((days|day|months|month|week|weeks|year|years|yr|yrs|minute|minutes|min|mins|hour|hours|hr|hrs)(?=\s|$))/gi);
        const parsedExpression = regex.exec(dateStr);
        if(!parsedExpression) return false;
        
        let timeOffset = this.processTimeOffset(parsedExpression[2]);
        if(!timeOffset) return false;
        
        let mathFn = 'subtract';
        
        let myMoment: moment.Moment = moment();
        
        myMoment = myMoment[mathFn](1, timeOffset);
        return myMoment.format(constant.TIME_FORMAT);
        }
        else if(dateStr.toLowerCase() === constant.YESTERDAY.toLowerCase()) {
        return constant.YESTERDAY.toLowerCase();              
        }
        else if(dateStr === constant.TODAY.toLowerCase()) {
        return moment().startOf('day').format(constant.TIME_FORMAT);      
        }
        else if(dateStr.startsWith('now')) {
        const regex = new RegExp(/(now)(\+|\-)(\d+)((days|day|months|month|week|weeks|year|years|yr|yrs|minute|minutes|min|mins|hour|hours|hr|hrs)(?=\s|$))/gi);
        const parsedExpression = regex.exec(dateStr);
        
        if(!parsedExpression) return false;
        let myMoment: moment.Moment = moment();
        
        const mathFn = this.getMathFn(parsedExpression[2]);
        if(!mathFn) return false;
        
        let duration = parseInt(parsedExpression[3]);
        
        let timeOffset = this.processTimeOffset(parsedExpression[4]);
        if(!timeOffset) return false;
        
        myMoment = myMoment[mathFn](duration, timeOffset);
        return myMoment.format(constant.TIME_FORMAT);      
        
        }
        else if((val.split(' to ')).length === 2)
        {
        let time = val;
        let s = val && val.split(' to ');
        let returnstring: string;
        const regex = new RegExp('[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]');
       
        
        returnstring =  regex.test(s[0]) ? regex.test(s[1]) ? (moment(s[1]).diff(moment(s[0]), 'days')) < 0 ? 'Invalid date.Start date should be less than end date' : 'valid' : 'Invalid' : 'Invalid start datetttt';
        
        return returnstring;
        }
        return false;
        } 
    
        getMathFn(symbol: string) {
          const value = symbol === "+" ? 'add' : symbol == "-" ? 'subtract' : false;
          return value;
        }
    
        calculateDisplayDate(tframe, parsedDateValue) {
          let date1 = moment().subtract(1, 'day').startOf('day').toLocaleString();
          let date2 =  moment().subtract(1, 'day').endOf('day').toLocaleString();
          if(parsedDateValue == 'valid'){
            this.setDisplayString(tframe);
          }else{
            !parsedDateValue ? this.setDisplayString(constant.ERR['1']) : parsedDateValue == 'valid' ? this.setDisplayString(tframe) : parsedDateValue == constant.YESTERDAY.toLowerCase() ? this.setDisplayString(moment(date1).format(constant.TIME_FORMAT) +' to '+moment(date2).format(constant.TIME_FORMAT)) : parsedDateValue !== 'Invalid date' && parsedDateValue !== constant.YESTERDAY.toLowerCase() ? this.setDisplayString(parsedDateValue +' to ' +moment().format (constant.TIME_FORMAT)) : (parsedDateValue == 'Invalid start dateppp' || parsedDateValue == 'Invalid date.Start date should be less than end date') ? this.setDisplayString(parsedDateValue) : this.setDisplayString(constant.ERR['1']);
          }
        
        }
    
        setDisplayString(display?: string) {
          this.displayString = display;   
        }
        processTimeOffset(timeOffset: string) { 
          if(constant.timeArray.indexOf(timeOffset) === -1) return false;
          return constant.shortHandMap[timeOffset] ? constant.shortHandMap[timeOffset] : timeOffset;
        }
  
  
  }