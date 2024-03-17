class Directives {
    constructor(Compile_Directives){
        this.Compile_Directives = Compile_Directives;
    }

    directiveExists(directive)
    {
        return this.mapDirectives().map((el) => el.directive).includes(directive);
    }

    mapDirectives()
    {
        return Object.keys(this.Compile_Directives).map((el) => ({ directive: this.Compile_Directives[el], directiveKey: el }));
    }

    findDirectiveName(directive)
    {        
        return this.directiveExists(directive) ? this.mapDirectives().find(el => el.directive === directive)?.directiveKey : null;
    }

    searchDirectives(directive)
    {
        return this.directiveExists(directive) ? this.findDirectiveName(directive) : null;
    }
}

module.exports = Directives;