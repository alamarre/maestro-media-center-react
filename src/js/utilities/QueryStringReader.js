class QueryStringReader {    
    parseParameters(queryString) {
        var params = queryString.split('&');
        var results = {};
        for (var i = 0; i < params.length; i++)
        {
            var param = params[i].split('=');
            results[param[0]] =  decodeURIComponent(param[1]);
        }
        return results;
    }
    
    readQueryString() {
        var queryString = window.location.search.substring(1);
        this.parameters = this.parseParameters(queryString);
    }
    
    getParameter(name) {
        this.readQueryString();
        return this.parameters[name];
    }
    
    getParameterFromUrl(url,name) {
        var queryString = url.substring(url.indexOf("?")+1);
        var parameters = this.parseParameters(queryString);
        return parameters[name];
    }
}

module.exports = QueryStringReader;