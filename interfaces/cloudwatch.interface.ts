// ----- interface para CloudWatch ------
export interface CloudWatchEvent {
    logStreamName?: string;
    timestamp?: number;
    message?: string;
    eventId?: string;
}