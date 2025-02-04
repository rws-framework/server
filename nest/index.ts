import 'reflect-metadata';
import common, { 
    Injectable, 
    Get, Post, Delete, Put,
    Module  
} from '@nestjs/common';
import core, { NestFactory } from '@nestjs/core';
import { RWSControllerDecorator as RWSController } from '../src/controller/_decorator';
import { RWSRoute } from './decorators/RWSRoute';
import { RWSConfigInjector, BootstrapRegistry } from './decorators/RWSConfigInjector';
import { RWSBootstrap } from './bootstrap';
const NestRoute = {
    Get, Post, Delete, Put
}

export {    
    common, core, 
    RWSController, 
    NestRoute,
    Injectable,
    NestFactory, Module,
    RWSRoute,
    RWSConfigInjector,    
    BootstrapRegistry,
    RWSBootstrap
};