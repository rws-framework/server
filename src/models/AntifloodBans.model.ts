import { RWSCollection, RWSModel, TrackType, IdType } from "@rws-framework/db";
import { IAntifloodBansModelInterface, IRequestData } from "../types/antiflood.types";
import { Request } from 'express';

@RWSCollection('antiflood_bans', { noId: true })
class AntifloodBans extends RWSModel<AntifloodBans> implements IAntifloodBansModelInterface {
    @IdType(String, {
        noAuto: true
    })
    ip: string;

    @TrackType(String, { required: true })
    agent: string;

    @TrackType(Object, { required: true })
    requestData: IRequestData;

    @TrackType(Number, { required: true })
    strikes: number;

    @TrackType(Date, { required: true })
    bannedUntil: Date;
    
    @TrackType(Boolean, { required: false })
    permaBan: boolean = false;

    @TrackType(Date, { required: true })
    created_at: Date;  
    
    static async buildFromRequestData(req: Request): Promise<AntifloodBans> {
        const requestData: IRequestData = {
            headers: req.headers,
            payload: req.body
        };

        const antifloodBan = new AntifloodBans();
        antifloodBan.ip = req.ip;
        antifloodBan.agent = req.headers['user-agent'] || '';
        antifloodBan.requestData = requestData;
        antifloodBan.strikes = 1;
        antifloodBan.bannedUntil = new Date(Date.now() + (15 * 60 * 1000));
        antifloodBan.created_at = new Date();

        console.log(`[AntifloodBans] buildFromRequestData: created new antiflood ban for IP ${antifloodBan.ip}`);

        await antifloodBan.save();

        return antifloodBan;
    }

    static async recordStrike(req: Request): Promise<AntifloodBans> {
        const existing = await AntifloodBans.findOneBy({ conditions: { ip: req.ip } });
        const ban = Array.isArray(existing) ? existing[0] : existing;

        if (ban) {
            ban.strikes += 1;
            if (ban.strikes < 3) {
                ban.bannedUntil = Date.now() + (15 * 60 * 1000);
            } else {
                ban.permaBan = true;
            }
            await ban.save();
            return ban;
        }

        return AntifloodBans.buildFromRequestData(req);
    }
}

export default AntifloodBans;
