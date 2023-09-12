"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runShellCommand = exports.SetupRWS = void 0;
const AppConfigService_1 = __importDefault(require("./services/AppConfigService"));
const _model_1 = __importDefault(require("./models/_model"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("reflect-metadata");
const DBService_1 = __importDefault(require("./services/DBService"));
const TimeSeriesModel_1 = __importDefault(require("./models/types/TimeSeriesModel"));
const ProcessService_1 = __importDefault(require("./services/ProcessService"));
const ConsoleService_1 = __importDefault(require("./services/ConsoleService"));
const { log, warn, error, color } = ConsoleService_1.default;
const { runShellCommand } = ProcessService_1.default;
exports.runShellCommand = runShellCommand;
function generateModelSections(constructor) {
    let section = '';
    // Get the prototype of the model instance
    const modelMetadatas = _model_1.default.getModelAnnotations(constructor); // Pass the class constructor   
    let embed = false;
    let modelName = constructor._collection;
    // if(Model.isSubclass(constructor, EmbedModel)){
    //   modelName = constructor.name;
    //   embed = true;
    //   throw new Error('Embed models are not supported');
    // }
    section += `model ${modelName} {\n`;
    section += `\tid String @map("_id") @id @default(auto()) @db.ObjectId\n`;
    for (const key in modelMetadatas) {
        const modelMetadata = modelMetadatas[key].metadata;
        const requiredString = modelMetadata.required ? '' : '?';
        const annotationType = modelMetadatas[key].annotationType;
        if (annotationType === 'Relation') {
            section += `\t${key} ${modelMetadata.relatedTo}${requiredString} @relation(fields: [${modelMetadata.relationField}], references: [${modelMetadata.relatedToField}])\n`;
            section += `\t${modelMetadata.relationField} String${requiredString} @db.ObjectId\n`;
        }
        else if (annotationType === 'InverseRelation') {
            section += `\t${key} ${modelMetadata.inversionModel}[]`;
        }
        else if (annotationType === 'InverseTimeSeries') {
            section += `\t${key} String[] @db.ObjectId`;
        }
        else if (annotationType === 'TrackType') {
            const tags = modelMetadata.tags.map((item) => '@' + item);
            section += `\t${key} ${toConfigCase(modelMetadata)}${requiredString} ${tags.join(' ')}\n`;
        }
    }
    section += `\n}`;
    return section;
}
function toConfigCase(modelType) {
    const type = modelType.type;
    const input = type.name;
    if (input == 'Number') {
        return 'Int';
    }
    if (input == 'Object') {
        return 'Json';
    }
    if (input == 'Date') {
        return 'DateTime';
    }
    const firstChar = input.charAt(0).toUpperCase();
    const restOfString = input.slice(1);
    return firstChar + restOfString;
}
async function main(cfg) {
    const AppConfigService = (0, AppConfigService_1.default)(cfg);
    const dbUrl = await AppConfigService.get('mongo_url');
    const moduleDir = path_1.default.resolve(__dirname) + '/../..';
    const executionDir = path_1.default.resolve(process.cwd());
    const dbType = 'mongodb';
    let template = `generator client {\n
    provider = "prisma-client-js"\n
  }\n\n`;
    template += `\ndatasource db {\n
    provider = "${dbType}"\n
    url = env("DATABASE_URL")\n
  }\n\n`;
    const usermodels = await AppConfigService.get('user_models');
    usermodels.forEach((model) => {
        const modelSection = generateModelSections(model);
        template += '\n\n' + modelSection;
        if (_model_1.default.isSubclass(model, TimeSeriesModel_1.default)) {
            DBService_1.default.collectionExists(model._collection).then((exists) => {
                if (exists) {
                    return;
                }
                log(color().green('[RWS Init]') + ` creating TimeSeries type collection from ${model} model`);
                DBService_1.default.createTimeSeriesCollection(model._collection);
            });
        }
    });
    const schemaPath = path_1.default.join(moduleDir, 'prisma', 'schema.prisma');
    fs_1.default.writeFileSync(schemaPath, template);
    process.env.DB_URL = dbUrl;
    // Define the command you want to run
    await ProcessService_1.default.PM2ExecCommand('npx prisma generate --schema=' + schemaPath, { options: { env: {
                DB_URL: dbUrl
            } } });
    log(color().green('[RWS Init]') + ' prisma schema generated from ', schemaPath);
    return;
}
const SetupRWS = main;
exports.SetupRWS = SetupRWS;
//# sourceMappingURL=install.js.map