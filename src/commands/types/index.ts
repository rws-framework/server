import { ConsoleService } from "../../services/ConsoleService";
import { NestDBService as DBService } from "../../services/NestDBService";
import { ProcessService } from "../../services/ProcessService";
import { UtilsService } from "../../services/UtilsService";
import { RWSConfigService } from "../../services/RWSConfigService";

export interface ICommandBaseServices {
    utilsService: UtilsService;
    consoleService: ConsoleService;
    configService: RWSConfigService;
    processService: ProcessService;
    dbService: DBService;
}