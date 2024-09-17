import common, { 
    Injectable, 
    Get, Post, Delete, Put,
    Param, Body,
    Module  
} from '@nestjs/common';
import { Command, Positional } from 'nestjs-command';
import core, { NestFactory } from '@nestjs/core';
import { Controller } from '../src/controller';

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
    Param, Body
};