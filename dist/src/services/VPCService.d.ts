import TheService from "./_service";
declare class VPCService extends TheService {
    findDefaultSubnetForVPC(): Promise<[string, string]>;
    private getSubnetIdForVpc;
    listSecurityGroups(): Promise<string[]>;
    getDefaultRouteTable(vpcId: string, subnetId?: string): Promise<AWS.EC2.RouteTable>;
    createVPCEndpointIfNotExist(vpcId: string): Promise<string>;
    ensureRouteToVPCEndpoint(vpcId: string, vpcEndpointId: string): Promise<void>;
    findPublicSubnetInVPC(vpcId: string): Promise<AWS.EC2.Subnet | null>;
    calculateNextThirdOctetIncrement(range: number): number;
    createPublicSubnet(vpcId: string, range?: number, passedCIDRBlock?: string): Promise<AWS.EC2.CreateSubnetResult>;
    private extractThirdOctet;
    waitForNatGatewayAvailable(natGatewayId: string): Promise<void>;
}
declare const _default: VPCService;
export default _default;
