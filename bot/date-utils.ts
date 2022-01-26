import moment from 'moment';

const TODAY = ['today', 'td', 'сегодня', 'сег', 'сёння', 'сн'];
const YESTERDAY = ['yesterday', 'yd', 'вчера', 'вч', 'учора', 'уч'];
const MONTHS = [
    ['JANUARY', 'JAN', 'ЯНВАРЬ', 'ЯНВ', 'СТУДЗЕНЬ', 'СТУ', 'СТУДЗ'],
    ['FEBRUARY', 'FEB', 'ФЕВРАЛЬ', 'ФЕВ', 'ФЕВР', 'ЛЮТЫ', 'ЛЮТ'],
    ['MARCH', 'MAR', 'МАРТ', 'МАР', 'САКАВІК', 'САК'],
    ['APRIL', 'APR', 'АПРЕЛЬ', 'АПР', 'КРАСАВІК', 'КРА', 'КРАС'],
    ['MAY', 'МАЙ', 'ТРАВЕНЬ', 'ТРА', 'ТРАВ'],
    ['JUNE', 'JUN', 'ИЮНЬ', 'ЧЭРВЕНЬ', 'ЧЭР', 'ЧЭРВ'],
    ['JULY', 'JUL', 'ИЮЛЬ', 'ЛІПЕНЬ', 'ЛІП'],
    ['AUGUST', 'AUG', 'АВГУСТ', 'АВГ', 'ЖНІВЕНЬ', 'ЖНІ', 'ЖНІВ'],
    ['SEPTEMBER', 'SEP', 'СЕНТЯБРЬ', 'СЕН', 'СЕНТ', 'ВЕРАСЕНЬ', 'ВЕР'],
    ['OCTOBER', 'OCT', 'ОКТЯБРЬ', 'ОКТ', 'КАСТРЫЧНІК', 'КАС', 'КАСТР'],
    ['NOVEMBER', 'NOV', 'НОЯБРЬ', 'НОЯБ', 'ЛІСТАПАД', 'ЛІС', 'ЛІСТ'],
    ['DECEMBER', 'DEC', 'ДЕКАБРЬ', 'ДЕК', 'СНЕЖАНЬ', 'СНЕ', 'СНЕЖ'],
]


export class DateUtils {

    public static init() {
        moment.locale('ru');
        console.log('DateUtils initialized');
    }

    private static today(): moment.Moment {
        return moment().utc(true).startOf('day');
    }

    public static todayDate(): Date {
        return DateUtils.today().toDate();
    }

    private static yesterday(): moment.Moment {
        return DateUtils.today().subtract(1, 'day')
    }

    public static currentMonthKey(): string {
        return DateUtils.today().format('MMM').toUpperCase();
    }

    public static previousMonthKey(): string {
        return DateUtils.today().subtract(1, 'month').format('MMM').toUpperCase();
    }

    public static parseDate(text: string): Date | null {

        if (TODAY.includes(text.toLowerCase())) {
            return DateUtils.today().toDate();
        }
        if (YESTERDAY.includes(text.toLowerCase())) {
            return DateUtils.yesterday().toDate()
        }
        const parts = text.split(/[-\\/]/);
        if (parts.length == 2) {
            const parsedAsMonth = parts.map( p => DateUtils.parseMonth(p));
            const parsedAsDay = parts.map(p => DateUtils.parseDay(p));

            if(parsedAsMonth[0] && parsedAsDay[1]) {
                return parsedAsMonth[0].date(parsedAsDay[1]).toDate();
            }
            if(parsedAsMonth[1] && parsedAsDay[0]) {
                return parsedAsMonth[1].date(parsedAsDay[0]).toDate();
            }
            return null;
        }

        return DateUtils.parseMonth(text)?.toDate() ?? null;

    }

    private static parseMonth(text: string): moment.Moment | null {
        const month = MONTHS.map(m => m.includes(text.toUpperCase())).findIndex(p => p);
        if(month === -1){
            return null;
        }

        const am = DateUtils.today().month(month)
        if(month > DateUtils.today().month()) {
            am.subtract(1, 'year');
        }
        return am.startOf('month');
    }

    private static parseDay(text): number | null {
        return (text.match(/^(0?[1-9]|[12][0-9]|3[01])$/) ?? []).length !== 0 ? +text : null;
    }

    public static formatDate(date: Date, forPrint?: boolean): string {
        const format = forPrint === true ? 'DD MMM YYYY, ddd' : 'YYYY-MM-DD';
        return moment(date).format(format);
    }

    public static isInMonth(date: Date, month: string): boolean {
        const monthMoment = DateUtils.parseMonth(month);
        const dateMoment = moment(date);
        if(!monthMoment) {
            return false;
        }
        return monthMoment.year() === dateMoment.year() && monthMoment.month() === dateMoment.month()
    }
}
