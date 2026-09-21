import { IRWSModel } from "@rws-framework/db";
import { IncomingHttpHeaders } from "http";

export interface IAntiFloodClientRecord {
    requests: number[];
    routes: Map<string, number[]>;
    probes: number;
    blockedUntil: number;
    permaBan: boolean;
}

export interface IAntifloodBansModelInterface extends IRWSModel {     
    ip: string;
    agent: string;
    requestData: IRequestData;
    strikes: number;
    bannedUntil: number;
    permaBan: boolean;
    created_at: Date;  
}

export interface IRequestData {
    headers: IncomingHttpHeaders;
    payload: any;
}
