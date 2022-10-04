import WebuntisCalendar from "./WebuntisCalendar";

export default class {
    public calendars: { [key: number]: WebuntisCalendar } = {};
    private refreshRate = 1000 * 60 * 10 // 10 minutes

    constructor() { }

    public registerCalendar(classId: number) {
        const calendar = new WebuntisCalendar(classId);
        this.calendars[classId] = calendar;
        return calendar;
    }

    public getCalendar(classId: number) {
        const calendar = this.calendars[classId];
        return calendar;
    }

    public async start() {
        console.log("Started fetching yearly calendar...")
        for (const calendar of Object.values(this.calendars)) {
            await calendar.fetchYearlyCalendar();
        }
        console.log("Finished fetching yearly calendar. Ready!");

        setInterval(() => this.refreshCalendars(), this.refreshRate);
    }

    private async refreshCalendars() {
        const now = new Date();
        console.log(`[${now.getHours()}:${now.getMinutes()}] Fetching calendar updates`)
        for (const calendar of Object.values(this.calendars)) {
            calendar.calendar.clear();
            await calendar.fetchYearlyCalendar();
        }
        console.log(`[${now.getHours()}:${now.getMinutes()}] Done!`)
    }
}