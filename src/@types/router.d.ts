export module BecklynJavaScriptRouter
{
    type TextToken = [
        "text", // type
        string, // text content
    ];

    type VariableToken = [
        "variable", // type
        string,     // preceding text
        string,     // regex to match the variable
        string,     // variable name
    ];
    type Token = TextToken|VariableToken;

    interface PortMapping
    {
        [scheme: string]: number;
    }

    /**
     * The data of a single route
     */
    export interface Route
    {
        host: Token[];
        path: Token[];
        schemes: string[];
        variables: string[];
    }

    /**
     * The router context
     */
    export interface Context
    {
        baseUrl: string;
        host: string;
        ports: PortMapping;
        scheme: string;
    }

    /**
     * All the routes in the route collection
     */
    export interface RouteCollection
    {
        [name: string]: Route;
    }

    /**
     * The complete init data
     */
    export interface InitData
    {
        context: Context;
        routes: RouteCollection;
    }
}
