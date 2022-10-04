import EventEmitter from "events";
import { ICalCalendar } from "ical-generator";
import fetch from 'node-fetch';
import { WebuntisResponse } from "./types";

enum ElementType {
    CLASS = 1,
    TEACHER = 2,
    SUBJECT = 3,
    ROOM = 4
}
// Element types:
// 1 = CLASS
// 2 = Teacher
// 3 = SUBJECT
// 4 = ROOM

export default class extends EventEmitter {
    public classId: number;
    public calendar: ICalCalendar = new ICalCalendar();
    private headers = {
        'Cookie': `schoolname="${process.env.SCHOOL}"`
    }

    constructor(classId: number) {
        super();
        this.classId = classId;
    }

    public async fetchYearlyCalendar() {
        const now = new Date();
        const end = new Date(2023, 5, 31);

        for (; now.getTime() < end.getTime(); now.setDate(now.getDate() + 7)) {
            await this.fetchWeek(now);
        }
    }

    public async fetchWeek(day: Date) {
        const url = `https://arche.webuntis.com/WebUntis/api/public/timetable/weekly/data?elementType=1&elementId=${this.classId}&date=${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}&formatId=3`;
        const response = await this.fetchWebuntisData(url);
        const classPeriods = response.elementPeriods[this.classId];
        for (const period of classPeriods) {

            let subjectName;
            let classes = [];
            let room;
            let teacher;

            for (const element of period.elements) {
                const elementReferenceID = element.id;
                const referencedElement = response.elements.find(elem => elem.id === elementReferenceID)!;

                if (referencedElement.type == ElementType.CLASS) {
                    classes.push(referencedElement.displayname!);
                } else if (referencedElement.type == ElementType.TEACHER) {
                    teacher = referencedElement.longName;
                } else if (referencedElement.type == ElementType.SUBJECT) {
                    subjectName = referencedElement.displayname!;
                } else if (referencedElement.type == ElementType.ROOM) {
                    room = referencedElement.displayname!;
                }
            }

            const dateString = period.date.toString() // yyyymmdd
            const year = +dateString.substring(0, 4);
            const month = +dateString.substring(4, 6);
            const day = +dateString.substring(6, 8);
            const date = new Date(year, month - 1, day);

            // Starting hour
            let startHourString = period.startTime.toString();
            if (startHourString.length == 3) startHourString = "0" + startHourString
            const shour = +startHourString.substring(0, 2);
            const sminutes = +startHourString.substring(2, 4);
            const startHour = new Date(date.getTime());
            startHour.setHours(shour, sminutes);

            // Ending hour
            let endHourString = period.endTime.toString();
            if (endHourString.length == 3) endHourString = "0" + endHourString;
            const ehour = +endHourString.substring(0, 2);
            const eminutes = +endHourString.substring(2, 4);
            const endHour = new Date(date.getTime());
            endHour.setHours(ehour, eminutes);

            this.registerActivity({
                subject: subjectName as string,
                classes: classes,
                room: room as string,
                teacher: teacher as string,
                starthour: startHour,
                endhour: endHour
            })
        }
    }

    private async fetchWebuntisData(url: string): Promise<WebuntisResponse> {
        try {
            const response = await fetch(url, {
                headers: this.headers as any
            }).then((res) => res.json()).then((res) => res.data.result.data as WebuntisResponse);
            return response;
        } catch (ignored) {
            console.log("Request to webuntis failed. Trying again in 5 seconds...");
            await sleep(5000);
            return await this.fetchWebuntisData(url);
        }
    }

    private async registerActivity(activity: { subject: string, classes: string[], room: string, teacher: string, starthour: Date, endhour: Date }) {
        // Check if the activity already exists within the calendar
        const exists = this.calendar.events().find(event => event.start() == activity.starthour && event.end() == activity.endhour && event.summary() == activity.subject)
        if (exists) return;

        this.calendar.createEvent({
            start: activity.starthour,
            end: activity.endhour,
            summary: activity.subject,
            location: activity.room,
            description: activity.classes.join(', ')
        });
    }
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}