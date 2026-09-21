import { IRWSModel } from "@rws-framework/db";
import { IncomingHttpHeaders } from "http";

export interface IAntiFloodClientRecord {
    requests: number[];
    routes: Map<string, number[]>;
    probes: number;
    blockedUntil: Date | null;
    permaBan: boolean;
}

export interface IAntifloodBansModelInterface extends IRWSModel {     
    ip: string;
    agent: string;
    requestData: IRequestData;
    strikes: number;
    bannedUntil: Date | null;
    permaBan: boolean;
    created_at: Date;  
}

export interface IRequestData {
    headers: IncomingHttpHeaders;
    payload: any;
}
