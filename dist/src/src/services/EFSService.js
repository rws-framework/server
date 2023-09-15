"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const LambdaService_1 = __importDefault(require("./LambdaService"));
const AWSService_1 = __importDefault(require("./AWSService"));
const ProcessService_1 = __importDefault(require("./ProcessService"));
const path_1 = __importDefault(require("path"));
const { log, warn, error, color, AWSProgressBar, rwsLog } = ConsoleService_1.default;
const __STATE_WAIT_TIME = 3000; //ms
class EFSService extends _service_1.default {
    constructor() {
        super();
    }
    async getOrCreateEFS(functionName, vpcId, subnetId) {
        const response = await AWSService_1.default.getEFS().describeFileSystems({ CreationToken: functionName }).promise();
        if (response.FileSystems && response.FileSystems.length > 0) {
            const fileSystemId = response.FileSystems[0].FileSystemId;
            const accessPoints = await this.getAccessPoints(fileSystemId);
            if (!accessPoints.length) {
                throw "No acces point in EFS for RWS lambdas";
            }
            log(`${color().green('[RWS Cloud FS Service]')} EFS exists:`, {
                efsId: fileSystemId,
                apARN: accessPoints[0].AccessPointArn
            });
            return [fileSystemId, accessPoints[0].AccessPointArn, true];
        }
        else {
            const params = {
                CreationToken: functionName,
                PerformanceMode: 'generalPurpose',
            };
            try {
                const response = await AWSService_1.default.getEFS().createFileSystem(params).promise();
                await this.waitForEFS(response.FileSystemId);
                const fsMountId = await this.createMountTarget(response.FileSystemId, subnetId);
                await this.waitForFileSystemMount(response.FileSystemId);
                const [accessPointId, accessPointArn] = await this.createAccessPoint(response.FileSystemId);
                await this.waitForAccessPoint(accessPointId);
                const endpointId = await AWSService_1.default.createVPCEndpointIfNotExist(vpcId);
                await AWSService_1.default.ensureRouteToVPCEndpoint(vpcId, endpointId);
                log(`${color().green('[RWS Cloud FS Service]')} EFS Created:`, response);
                return [response.FileSystemId, accessPointArn, false];
            }
            catch (err) {
                error('Error creating EFS:', err);
                throw err; // It's a good practice to throw the error so the caller knows something went wrong.
            }
        }
    }
    async deleteEFS(fileSystemId) {
        try {
            await AWSService_1.default.getEFS().deleteFileSystem({ FileSystemId: fileSystemId }).promise();
            error(`EFS with ID ${fileSystemId} has been deleted.`);
        }
        catch (err) {
            error('Error while deleting EFS:');
            log(err);
            throw err;
        }
    }
    async waitForEFS(fileSystemId) {
        let isAvailable = false;
        log(`${color().yellowBright('[EFS Listener] awaiting EFS state change')}`);
        while (!isAvailable) {
            const mountResponse = await AWSService_1.default.getEFS().describeFileSystems({ FileSystemId: fileSystemId }).promise();
            if (mountResponse.FileSystems && mountResponse.FileSystems.length && mountResponse.FileSystems[0].LifeCycleState === 'available') {
                isAvailable = true;
            }
            else {
                log(`${color().yellowBright('[EFS Listener] .')}`);
                await new Promise(resolve => setTimeout(resolve, __STATE_WAIT_TIME)); // wait for 5 seconds before checking again
            }
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async waitForFileSystemMount(fileSystemId) {
        while (true) {
            try {
                log(`${color().yellowBright('[EFS Mount Listener] awaiting EFS mount change')}`);
                const response = await AWSService_1.default.getEFS().describeMountTargets({ FileSystemId: fileSystemId }).promise();
                const isMounted = response.MountTargets.some(mountTarget => mountTarget.LifeCycleState === 'available');
                if (isMounted) {
                    log(`${color().yellowBright('[EFS Mount Listener] DONE')}`);
                    return true;
                }
                else {
                    log(`${color().yellowBright('[EFS Mount Listener] is during creation process...')}`);
                }
                log(`${color().yellowBright('[EFS Mount Listener] .')}`);
                await ProcessService_1.default.sleep(__STATE_WAIT_TIME);
            }
            catch (error) {
                console.error('Error while checking EFS mount status:', error);
                throw error;
            }
        }
    }
    async waitForAccessPoint2(fileSystemId, accessPointId) {
        let isAvailable = false;
        log(`${color().yellowBright('[EFS AP Listener] awaiting EFS access point change')}`, fileSystemId, accessPointId);
        while (!isAvailable) {
            const accessPointResponse = await AWSService_1.default.getEFS().describeAccessPoints({ FileSystemId: fileSystemId, AccessPointId: accessPointId }).promise();
            if (accessPointResponse.AccessPoints && accessPointResponse.AccessPoints.length && accessPointResponse.AccessPoints[0].LifeCycleState === 'available') {
                isAvailable = true;
            }
            else {
                log(`${color().yellowBright('[EFS AP Listener] .')}`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 5 seconds before checking again                
            }
        }
    }
    async waitForAccessPoint(accessPointId) {
        let isAvailable = false;
        log(`${color().yellowBright('[EFS AP Listener] awaiting EFS access point change')}`, accessPointId);
        while (!isAvailable) {
            const accessPointResponse = await AWSService_1.default.getEFS().describeAccessPoints({ AccessPointId: accessPointId }).promise();
            if (accessPointResponse.AccessPoints && accessPointResponse.AccessPoints.length && accessPointResponse.AccessPoints[0].LifeCycleState === 'available') {
                isAvailable = true;
            }
            else {
                log(`${color().yellowBright('[EFS AP Listener] .')}`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 5 seconds before checking again                
            }
        }
    }
    generateClientToken() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 5);
    }
    async getAccessPoints(fileSystemId) {
        try {
            const params = {
                FileSystemId: fileSystemId // specify the FileSystemId to filter access points for a specific EFS
            };
            const response = await AWSService_1.default.getEFS().describeAccessPoints(params).promise();
            if (response.AccessPoints && response.AccessPoints.length > 0) {
                return response.AccessPoints; // this will return an array of access points
            }
            else {
                log('No access points found for the specified EFS.');
                return null;
            }
        }
        catch (err) {
            error('Error getting access point:', error);
            throw err;
        }
    }
    async createAccessPoint(fileSystemId) {
        const clientToken = this.generateClientToken(); // Generate a unique client token
        const params = {
            FileSystemId: fileSystemId,
            ClientToken: clientToken,
            PosixUser: {
                Uid: 1001,
                Gid: 1001
            },
            RootDirectory: {
                Path: "/mnt/efs",
                CreationInfo: {
                    OwnerUid: 1001,
                    OwnerGid: 1001,
                    Permissions: "755"
                }
            }
        };
        try {
            const response = await AWSService_1.default.getEFS().createAccessPoint(params).promise();
            log(`${color().green('[RWS Cloud FS Service]')} EFS AP created:`, response);
            return [response.AccessPointId, response.AccessPointArn];
        }
        catch (error) {
            console.log('Error creating EFS access point:', error);
            throw error;
        }
    }
    async createMountTarget(fileSystemId, subnetId) {
        const params = {
            FileSystemId: fileSystemId,
            SubnetId: subnetId,
        };
        try {
            const response = await AWSService_1.default.getEFS().createMountTarget(params).promise();
            log(`${color().green('[RWS Cloud FS Service]')} EFS Mount Target created:`, response);
            return response.MountTargetId;
        }
        catch (error) {
            console.error('Error creating Mount Target:', error);
        }
    }
    async uploadToEFS(baseFunctionName, efsId, modulesS3Key, s3Bucket, vpcId, subnetId) {
        const efsLoaderFunctionName = await this.processEFSLoader(vpcId, subnetId);
        const params = {
            functionName: `${baseFunctionName}`,
            efsId,
            modulesS3Key,
            s3Bucket
        };
        try {
            log(`${color().green(`[RWS Lambda Service]`)} invoking EFS Loader as "${efsLoaderFunctionName}" lambda function for "${baseFunctionName}" with ${modulesS3Key} in ${s3Bucket} bucket.`);
            const response = await LambdaService_1.default.invokeLambda(efsLoaderFunctionName, params, 'Event');
            rwsLog('RWS Lambda Service', color().yellowBright(`"${efsLoaderFunctionName}" lambda function response:`));
            log(response);
            return; // JSON.parse(response.Response.Payload as string);
        }
        catch (error) {
            // await EFSService.deleteEFS(efsId);
            console.error('Error invoking Lambda:', error);
            throw error;
        }
    }
    async processEFSLoader(vpcId, subnetId) {
        const executionDir = process.cwd();
        const filePath = module.id;
        const cmdDir = filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '');
        const moduleDir = path_1.default.resolve(cmdDir, '..', '..', '..', '..');
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;
        const _UNZIP_FUNCTION_NAME = 'efs-loader';
        if (!(await LambdaService_1.default.functionExists('RWS-' + _UNZIP_FUNCTION_NAME))) {
            log(`${color().green(`[RWS Lambda Service]`)} creating EFS Loader as "${_UNZIP_FUNCTION_NAME}" lambda function.`, moduleDir);
            const zipPath = await LambdaService_1.default.archiveLambda(`${moduleDir}/lambda-functions/efs-loader`, moduleCfgDir);
            await LambdaService_1.default.deployLambda(_UNZIP_FUNCTION_NAME, zipPath, vpcId, subnetId, true);
        }
        return _UNZIP_FUNCTION_NAME;
    }
    async deleteDir() {
    }
}
exports.default = EFSService.getSingleton();
//# sourceMappingURL=EFSService.js.map