import common, { 
    Injectable, 
    Get, Post, Delete, Put,
    Param, Body,
    Module  
} from '@nestjs/common';
import { Command, Positional } from 'nestjs-command';
import core, { NestFactory } from '@nestjs/core';
import { Controller as NestController, ControllerOptions as NestControllerOptions } from '@nestjs/common';
import { RWSControllerDecorator, RWSControllerOptions } from '../src/controller/_decorator';

const NestRoute = {
    Get, Post, Delete, Put
}

const CLI = { Command, Positional }

export {    
    common, core,     
    NestRoute,    
    NestFactory, Module,    
    NestController as NativeNestController,
    NestControllerOptions as NativeNestOptions,

    CLI,

    RWSControllerDecorator as Controller, 
    RWSControllerOptions as ControllerOptions,

    Injectable,
    Param, Body,
    Get, Post, Delete, Put
};