import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {UtilsService, ConsoleService, AuthService } from '../index';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RWSFillService {
    constructor(        
        @Inject(forwardRef(() => UtilsService)) private utilsService: UtilsService,    
        @Inject(forwardRef(() => AuthService)) private authService: AuthService,
        @Inject(forwardRef(() => ConsoleService)) private consoleService: ConsoleService
    ){
    }

    fillBaseServices(target: {        
        utilsService: UtilsService,    
        authService: AuthService,
        consoleService: ConsoleService
    }){        
        target.utilsService = this.utilsService;
        target.authService = this.authService;
        target.consoleService = this.consoleService;
    }
}