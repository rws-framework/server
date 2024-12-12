import common, { 
    Injectable, 
    Get, Post, Delete, Put,
    Module  
} from '@nestjs/common';
import { Command, Positional } from 'nestjs-command';
import core, { NestFactory } from '@nestjs/core';
import { Controller } from '../src/controller';
import { RWSRoute } from './decorators/RWSRoute';
import { RWSConfigInjector, BootstrapRegistry } from './decorators/RWSConfigInjector';
import { RWSBootstrap } from './bootstrap';
const NestRoute = {
    Get, Post, Delete, Put
}

const CLI = { Command, Positional }

export {    
    common, core, 
    Controller, 
    NestRoute,
    CLI,
    Injectable,
    NestFactory, Module,
    RWSRoute,
    RWSConfigInjector,
    BootstrapRegistry,
    RWSBootstrap
};