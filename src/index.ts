import express from 'express';
import CalendarManager from './CalendarManager';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config(); // Load .env variables

const app = express();
app.use(morgan('dev'));
const calendarManager = new CalendarManager();

(async () => {
    await calendarManager.start();
})()

app.all('/:id', async (req, res) => {
    const calendarClassId = parseInt(req.params.id as string);
    if (isNaN(calendarClassId)) {
        return res.status(404).send("Not found");
    }

    let calendar = calendarManager.getCalendar(calendarClassId);
    if (!calendar) {
        console.log("New calendar requested: " + calendarClassId)
        calendarManager.registerCalendar(calendarClassId);
        calendar = calendarManager.getCalendar(calendarClassId);
        await calendar.fetchYearlyCalendar();
    }
    calendar.calendar.serve(res);
});

app.listen(process.env.PORT || 5000, () => {
    console.log("ready");
});