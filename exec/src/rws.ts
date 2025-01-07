import { BootstrapRegistry, RWSConfigInjector } from '../../nest/decorators/RWSConfigInjector';
import { InitCommand } from '../../src/commands/init.command';
import { RWSModule } from '../../src/runNest';
import { NestFactory } from '@nestjs/core';

@RWSConfigInjector(null) // Will be set during runtime
export class RWSCliBootstrap {
  private static _instance: RWSCliBootstrap;

  static async run(configPath: string): Promise<void> {
    if (!this._instance) {
      this._instance = new RWSCliBootstrap();
    }
    return this._instance.runCli(configPath);
  }

  protected static get instance(): RWSCliBootstrap {
    return this._instance;
  }

  async runCli(configPath: string): Promise<void> {
    try {
      // Load config from file
      const config = require(configPath);
      
      // Set config in registry if not already set
      if (!BootstrapRegistry.isInitialized()) {
        BootstrapRegistry.setConfig(config);
      }

      // Create module with config from registry
      const moduleRef = await RWSModule.forRoot(BootstrapRegistry.getConfig());

      // Create NestJS application context
      const app = await NestFactory.createApplicationContext(moduleRef, {
        logger: ['error']
      });

      // Get the command from arguments (e.g., 'init')
      const command = process.argv[3] || 'init';

      // Get the command instance
      const commandInstance = app.get(InitCommand);

      // Execute the command
      await commandInstance.run(config());

      await app.close();
    } catch (error) {
      console.error('Error in CLI bootstrap:', error);
      process.exit(1);
    }
  }
}