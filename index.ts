/**
 * @license
 * Copyright {organization} All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at {url for License page}
 */

import { Constants } from "./Constants";

export class DateTimeExpression {

  /**
   * 
   * @method parseTimeExpr
   * @param timeExpr 
   * @returns 
   * 
   */
  private parseTimeExpr = async (timeExpr: string): Promise<Date> => {
    let regex = new RegExp(Constants.TIME_REGEX);
    let timeVal = new Date(0);
    if (!!regex.test(timeExpr)) {
      try {
        if (!!timeExpr) {
          timeVal = new Date(timeExpr);
        }
      } catch (ex) {
        throw new Error(`Error in parsing time input with format ${ex}`);
      }
    } else {
      throw new Error(`Invalid time expression: ${timeExpr}`);
    }
    return timeVal;
  }

  /**
   * 
   * @method parseDateExpr
   * @param dateExpr 
   * @returns 
   * 
   */
  private parseDateExpr = async (dateExpr: string): Promise<Date> => {
    let regex = new RegExp(Constants.DATE_REGEX);
    let dateVal: Date = new Date(0);
    if (!!regex.test(dateExpr)) {
      try {
        if (!!dateExpr) {
          dateVal.setMilliseconds(parseInt(dateExpr));
        }
      } catch (ex) {
        throw new Error(`Error in parsing date input with format ${ex}`);
      }
    } else {
      throw new Error(`Invalid date expression: ${dateExpr}`);
    }
    return dateVal;
  }

  /**
   * 
   * @method parseDateRangeExpr
   * @param inputExpr 
   * @returns 
   * 
   */
  private parseDateRangeExpr = async (inputExpr: string): Promise<string[]> => {
    let output: string[] = [];
    if (!!inputExpr) {
      const dateRangeExpr = new RegExp(Constants.DATE_RANGE_REGEX);
      const hasDateRangeExpr: boolean = dateRangeExpr?.test(inputExpr);
      if (!!hasDateRangeExpr) {
        const dateRangeGroups = dateRangeExpr.exec(inputExpr)?.groups;
        if (!!dateRangeGroups) {
          const startDate: string = dateRangeGroups.STARTDATE;
          const endDate: string = dateRangeGroups.ENDDATE;
          if (!!startDate && !!endDate) {
            output = [startDate, endDate];
          } else {
            throw new Error("startDate and endDate cannot be undefined.")
          }
        } else {
          throw new Error(`No groups found for the expression: ${inputExpr}`)
        }
      } else {
        throw new Error("Input does not have the date range expression.")
      }
    }
    return output;
  }

  /**
   * 
   * @method getDateDelimiter
   * @param dateString 
   * @returns 
   * 
   */
  private getDateDelimiter = async (dateString: string): Promise<string> => {
    let output: string;
    if (!!dateString) {
      let isDotDelimited: boolean = (typeof dateString == "string") &&
        (dateString.split(".").length == 3);
      let isSlashDelimited: boolean = (typeof dateString == "string") &&
        (dateString.split("/").length == 3);
      let isDashDelimited: boolean = (typeof dateString == "string") &&
        (dateString.split("-").length == 3);
      if (isDotDelimited) {
        output = "."
      } else if (isSlashDelimited) {
        output = "/"
      } else if (isDashDelimited) {
        output = "-"
      } else {
        output = ""
      }
    } else {
      throw new Error("dateString must be a string.")
    }
    return output;
  }

  /**
   * 
   * @method buildDateFromString
   * @param dateString 
   * @returns 
   * 
   */
  private buildDateFromString = async (dateString: string): Promise<Date> => {
    let output: Date = new Date();
    if (!!dateString) {
      try {
        let delimiter: string = await this.getDateDelimiter(dateString);
        if (delimiter != "") {
          const [date, month, year] = dateString.split(delimiter);
          output.setDate(parseInt(date));
          output.setMonth(parseInt(month));
          output.setFullYear(parseInt(year));
        } else {
          console.error("[dot], [slash], and [dash] are the only allowed delimiters for dateString.")
        }
      } catch (ex) {
        throw new Error("Error in parsing date string delimiter.");
      }
    } else {
      throw new Error("dateString must be a string.")
    }
    return output;
  }

  /**
   * 
   * @method getTimeDifferenceInMilliseconds
   * @param startDate 
   * @param endDate 
   * @returns 
   * 
   */
  private getTimeDifferenceInMilliseconds = async (startDate: Date, endDate: Date): Promise<number> => {
    let output: number = 0;
    const startDateInMs: number = startDate?.getTime();
    const endDateInMs: number = endDate?.getTime();
    if (!!startDateInMs && !!endDateInMs) {
      if (endDateInMs > startDateInMs) {
        output = endDateInMs - startDateInMs;
      } else {
        output = startDateInMs - endDateInMs;
      }
    } else {
      throw new Error("startDate and endDate must be a valid date string. e.g. YYYY-MM-DD or YYYY/MM/DD")
    }
    return output;
  }

  /**
   * 
   * @method getDurationsFromMS
   * @param timeInMilliSeconds 
   * @returns 
   * 
   */
  private getDurationsFromMS = async (timeInMilliSeconds: number): Promise<Duration> => {
    let output: Duration = {
      years: 0,
      months: 0,
      days: 0,
      totalYears: 0,
      totalMonths: 0,
      totalWeeks: 0,
      totalDays: 0,
      totalHours: 0,
      totalMinutes: 0,
      totalSeconds: 0,
      totalMilliseconds: 0
    };

    output.totalMilliseconds = timeInMilliSeconds;
    output.totalSeconds = Math.floor(output.totalMilliseconds / 1000);
    output.totalMinutes = Math.floor(output.totalSeconds / 60);
    output.totalHours = Math.floor(output.totalMinutes / 60);
    output.totalDays = Math.floor(output.totalHours / 24);
    output.totalWeeks = Math.floor(output.totalDays / 7);
    output.totalMonths = Math.floor(output.totalDays / 30);
    output.totalYears = Math.floor(output.totalDays / 365);
    output.years = output.totalYears;
    output.months = Math.floor((output.totalDays - (output.years * 365)) / 30);
    output.days = Math.floor(output.totalDays - ((output.years * 365) + (output.months * 30)));

    return output;
  }

  /**
   * 
   * @method getDuration
   * @param dateExpr 
   * @returns 
   * 
   */
  private getDuration = async (dateExpr: string): Promise<Duration> => {
    let output: Duration;
    try {
      const parsedDateRangeExpr: string[] = await this.parseDateRangeExpr(dateExpr)
      const isValidDateExpr: boolean = (parsedDateRangeExpr.length == 2);
      if (!!isValidDateExpr) {
        const [endDateString, startDateString] = parsedDateRangeExpr;
        const endDate: Date = await this.buildDateFromString(endDateString);
        const startDate: Date = await this.buildDateFromString(startDateString);
        const totalMilisecondsInMs: number = await this.getTimeDifferenceInMilliseconds(startDate, endDate);
        const durations: Duration = await this.getDurationsFromMS(totalMilisecondsInMs);
        output = durations;
      } else {
        throw new Error("dateExpr does not have startDate and endDate expressions.")
      }
    } catch (ex) {
      throw new Error("Error in parsing the date range.");
    }
    return output;
  }

  /**
   * 
   * @method duration
   * @param dateExpr 
   * @returns
   *  
   */
  duration = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const durations: Duration = await this.getDuration(dateExpr);
        if (!!durations) {
          const YEARS: number = durations.years;
          const MONTHS: number = durations.months;
          const DAYS: number = durations.days;
          const yearString: string = (YEARS > 1) ? `${YEARS} years` : `${YEARS} year`;
          const monthString: string = (MONTHS > 1) ? `${MONTHS} months` : `${MONTHS} month`;
          const dayString: string = (DAYS > 1) ? `${DAYS} days` : `${DAYS} day`;
          output = `${yearString}, ${monthString}, ${dayString}`;
        }
      } catch (ex) {
        throw new Error(`Error in calculating duration for this date expression: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method durationYearMonth
   * @param dateExpr 
   * @returns 
   * 
   */
  durationYearMonth = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const durations: Duration = await this.getDuration(dateExpr);
        if (!!durations) {
          const YEARS: number = durations.years;
          const MONTHS: number = durations.months;
          const yearString: string = (YEARS > 1) ? `${YEARS} years` : `${YEARS} year`;
          const monthString: string = (MONTHS > 1) ? `${MONTHS} months` : `${MONTHS} month`;
          output = `${yearString}, ${monthString}`;
        }
      } catch (ex) {
        throw new Error(`Error in calculating duration for this date expression: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method durationYears
   * @param dateExpr 
   * @returns 
   * 
   */
  durationYears = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const durations: Duration = await this.getDuration(dateExpr);
        if (!!durations) {
          const YEARS: number = durations.years;
          output = (YEARS > 1) ? `${YEARS} years` : `${YEARS} year`;
        }
      } catch (ex) {
        throw new Error(`Error in calculating duration for this date expression: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method durationMonths
   * @param dateExpr 
   * @returns 
   * 
   */
  durationMonths = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const durations: Duration = await this.getDuration(dateExpr);
        if (!!durations) {
          const MONTHS: number = durations.totalMonths;
          output = (MONTHS > 1) ? `${MONTHS} months` : `${MONTHS} month`;
        }
      } catch (ex) {
        throw new Error(`Error in calculating duration for this date expression: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method durationWeeks
   * @param dateExpr 
   * @returns 
   * 
   */
  durationWeeks = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const durations: Duration = await this.getDuration(dateExpr);
        if (!!durations) {
          const WEEKS: number = durations.totalWeeks;
          output = (WEEKS > 1) ? `${WEEKS} weeks` : `${WEEKS} week`;
        }
      } catch (ex) {
        throw new Error(`Error in calculating duration for this date expression: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method durationDays
   * @param dateExpr 
   * @returns 
   * 
   */
  durationDays = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const durations: Duration = await this.getDuration(dateExpr);
        if (!!durations) {
          const DAYS: number = durations.totalDays;
          output = (DAYS > 1) ? `${DAYS} days` : `${DAYS} day`;
        }
      } catch (ex) {
        throw new Error(`Error in calculating duration for this date expression: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method durationHours
   * @param dateExpr 
   * @returns 
   * 
   */
  durationHours = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const durations: Duration = await this.getDuration(dateExpr);
        if (!!durations) {
          const HOURS: number = durations.totalHours;
          output = (HOURS > 1) ? `${HOURS} hours` : `${HOURS} hour`;
        }
      } catch (ex) {
        throw new Error(`Error in calculating duration for this date expression: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method durationMinutes
   * @param dateExpr 
   * @returns 
   * 
   */
  durationMinutes = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const durations: Duration = await this.getDuration(dateExpr);
        if (!!durations) {
          const MINUTES: number = durations.totalMinutes;
          output = (MINUTES > 1) ? `${MINUTES} minutes` : `${MINUTES} minute`;
        }
      } catch (ex) {
        throw new Error(`Error in calculating duration for this date expression: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method durationSeconds
   * @param dateExpr 
   * @returns
   *  
   */
  durationSeconds = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const durations: Duration = await this.getDuration(dateExpr);
        if (!!durations) {
          const SECONDS: number = durations.totalSeconds;
          output = (SECONDS > 1) ? `${SECONDS} seconds` : `${SECONDS} second`;
        }
      } catch (ex) {
        throw new Error(`Error in calculating duration for this date expression: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method durationMilliseconds
   * @param dateExpr 
   * @returns 
   * 
   */
  durationMilliseconds = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const durations: Duration = await this.getDuration(dateExpr);
        if (!!durations) {
          const MILLISECONDS: number = durations.totalMilliseconds;
          output = (MILLISECONDS > 1) ? `${MILLISECONDS} milliseconds` : `${MILLISECONDS} millisecond`;
        }
      } catch (ex) {
        throw new Error(`Error in calculating duration for this date expression: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method day
   * @param dateExpr 
   * @returns 
   * 
   */
  day = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const localDate: Date = await this.parseDateExpr(dateExpr);
        if (!!localDate) {
          output = new Date(localDate).getDay().toString();
        }
      } catch (ex) {
        throw new Error(`Error in parsing dateExpr: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method dayName
   * @param dateExpr 
   * @returns
   *  
   */
  dayName = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const localDate: Date = await this.parseDateExpr(dateExpr);
        if (!!localDate) {
          const day: number = new Date(localDate).getDay();
          output = Constants.WEEKDAYS[day];
        }
      } catch (ex) {
        throw new Error(`Error in parsing dateExpr: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method dayShortName
   * @param dateExpr 
   * @returns 
   * 
   */
  dayShortName = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const localDate: Date = await this.parseDateExpr(dateExpr);
        if (!!localDate) {
          const day: number = new Date(localDate).getDay();
          output = Constants.WEEKDAYS[day].slice(0, 3);
        }
      } catch (ex) {
        throw new Error(`Error in parsing dateExpr: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method month
   * @param dateExpr 
   * @returns
   *  
   */
  month = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const localDate: Date = await this.parseDateExpr(dateExpr);
        if (!!localDate) {
          output = (new Date(localDate).getMonth() + 1).toString();
        }
      } catch (ex) {
        throw new Error(`Error in parsing dateExpr: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method monthName
   * @param dateExpr 
   * @returns
   *  
   */
  monthName = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const localDate: Date = await this.parseDateExpr(dateExpr);
        if (!!localDate) {
          const month: number = new Date(localDate).getMonth();
          output = Constants.MONTHNAMES[month];
        }
      } catch (ex) {
        throw new Error(`Error in parsing dateExpr: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method monthShortName
   * @param dateExpr 
   * @returns 
   * 
   */
  monthShortName = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const localDate: Date = await this.parseDateExpr(dateExpr);
        if (!!localDate) {
          const month: number = new Date(localDate).getMonth();
          output = Constants.MONTHNAMES[month].slice(0, 3);
        }
      } catch (ex) {
        throw new Error(`Error in parsing dateExpr: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method year
   * @param dateExpr 
   * @returns 
   * 
   */
  year = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const localDate: Date = await this.parseDateExpr(dateExpr);
        if (!!localDate) {
          output = new Date(localDate).getFullYear().toString();
        }
      } catch (ex) {
        throw new Error(`Error in parsing dateExpr: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method yearShort
   * @param dateExpr 
   * @returns 
   * 
   */
  yearShort = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const localDate: Date = await this.parseDateExpr(dateExpr);
        if (!!localDate) {
          const fullyear: number = new Date(localDate).getFullYear();
          output = fullyear.toString().slice(2, 4);
        }
      } catch (ex) {
        throw new Error(`Error in parsing dateExpr: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method words
   * @param dateExpr 
   * @returns 
   * 
   */
  words = async (dateExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!dateExpr) {
      try {
        const localDate: Date = await this.parseDateExpr(dateExpr);
        if (!!localDate) {
          const day: string = await this.day(dateExpr);
          const monthName: string = await this.monthName(dateExpr);
          const year: string = await this.year(dateExpr);
          output = `${day} ${monthName} ${year}`;
        }
      } catch (ex) {
        throw new Error(`Error in parsing dateExpr: ${dateExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method hour
   * @param timeExpr 
   * @returns 
   * 
   */
  hour = async (timeExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!timeExpr) {
      try {
        const localTime: Date = await this.parseTimeExpr(timeExpr);
        if (!!localTime) {
          output = localTime.getHours().toString();
        }
      } catch (ex) {
        throw new Error(`Error in parsing timeExpr: ${timeExpr}`);
      }
    }
    return output;
  }

  /**
   * 
   * @method minute
   * @param timeExpr 
   * @returns 
   * 
   */
  minute = async (timeExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!timeExpr) {
      try {
        const localTime: Date = await this.parseTimeExpr(timeExpr);
        if (!!localTime) {
          output = localTime.getMinutes().toString();
        }
      } catch (ex) {
        throw new Error(`Error in parsing timeExpr: ${timeExpr}`);
      }
    }
    return output;
  }

  /**
   *
   * @method second
   * @param timeExpr 
   * @returns 
   * 
   */
  second = async (timeExpr: string): Promise<string> => {
    let output: string = Constants.INVALID_EXPRESSION;
    if (!!timeExpr) {
      try {
        const localTime: Date = await this.parseTimeExpr(timeExpr);
        if (!!localTime) {
          output = localTime.getSeconds().toString();
        }
      } catch (ex) {
        throw new Error(`Error in parsing timeExpr: ${timeExpr}`);
      }
    }
    return output;
  }
}

type Duration = {
  years: number,
  months: number,
  days: number,
  totalYears: number,
  totalMonths: number,
  totalWeeks: number,
  totalDays: number,
  totalHours: number,
  totalMinutes: number,
  totalSeconds: number,
  totalMilliseconds: number
}
Footer
© 2023 GitHub, Inc.
Footer navigation
Terms
Privacy
Security
Status
