import common, { 
    Injectable, 
    Get, Post, Delete, Put,
    Module  
} from '@nestjs/common';
import { Command, Positional } from 'nestjs-command';
import core, { NestFactory } from '@nestjs/core';
import { Controller } from '../src/controller';
import { RWSRoute } from './decorators/RWSRoute';
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
    RWSRoute
};