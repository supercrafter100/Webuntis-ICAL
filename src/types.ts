export interface WebuntisResponse {
    noDetails: boolean;
    elementIds: number[];
    elementPeriods: {
        [key: number]: {
            id: number;
            lessonId: number;
            lessonNumber: number;
            lessonCode: string;
            lessonBackColor: string;
            lessonText: string;
            periodText: string;
            hasPeriodText: boolean;
            periodInfo: string;
            periodAttachments: any[];
            substText: string;
            date: number;
            startTime: number;
            endTime: number;
            elements: {
                type: number;
                id: number;
                orgId: number;
                missing: boolean;
                state: string;
            }[];
            studentGroup: string;
            hasInfo: boolean;
            code: number;
            cellState: string;
            priority: number;
            is: {
                standard: boolean;
                event: boolean;
            };
            roomCapacity: number;
            studentCount: number;
        }[]
    };
    elements: {
        type: number;
        id: number;
        longName: string;
        displayname?: string;
        canViewTimetable: boolean;
        externKey: string;
        roomCapacity: number;
    }[];
    lastImportTimestamp: number;
}