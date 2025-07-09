import { INestApplication } from "@nestjs/common";
import { Helper } from "./_helper";
import { DiscoveryService } from "@nestjs/core";
import { RWSGateway } from "../gateways/_gateway";

export class GatewayHelper extends Helper {
    static hasRWSGatewayProvider(app: INestApplication): boolean {
    try {
        const discoveryService = app.get(DiscoveryService);
        const providers = discoveryService.getProviders();
        
        for (const provider of providers) {
            if (provider.instance && provider.instance.constructor) {
                // Check if the provider's constructor prototype chain includes RWSGateway
                let currentProto = provider.instance.constructor;
                while (currentProto && currentProto !== Object) {
                    if (currentProto === RWSGateway || currentProto.name === 'RWSGateway') {
                        return true;
                    }
                    currentProto = Object.getPrototypeOf(currentProto);
                }
            }
        }
        
        return false;
    } catch (error) {
        // If there's an error accessing the discovery service, return false
        console.warn('Could not check for RWSGateway providers:', error);
        return false;
    }
}
}