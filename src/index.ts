import {hasOwnProperty} from "mojave/runtime";
import {encode} from "qss";
import Context = BecklynJavaScriptRouter.Context;
import RouteCollection = BecklynJavaScriptRouter.RouteCollection;
import Token = BecklynJavaScriptRouter.Token;
import PortMapping = BecklynJavaScriptRouter.PortMapping;

const DEFAULT_PORTS: PortMapping = {
    http: 80,
    https: 443,
};

/**
 *
 */
type ParameterType = string | number | boolean | null | undefined
export interface RouteParameters
{
    [parameter: string]: ParameterType;
}

export enum ReferenceType
{
    ABSOLUTE_URL = 0,
    ABSOLUTE_PATH = 1,
    // RELATIVE_PATH is not supported, as it is pretty niche and would add quite a lot of bytes to the build
    NETWORK_PATH = 3,
}

/**
 * Sanitizes the pattern so that it works in JS.
 *
 * Sanitized cases:
 *      * A double + (`++`, possesive +) isn't supported in JS, so we just use a single `+` instead.
 */
function sanitizeRegex (pattern: string) : string
{
    return pattern.replace(/\++/, "+");
}


/**
 * Compiles the tokens to a string
 */
function compileTokens (tokens: Token[], parameters: RouteParameters) : string
{
    let compiled = tokens.map(token =>
    {
        if (token[0] === "text")
        {
            return token[1];
        }

        let regex = token[2];
        let name = token[3];
        let value = stringifyValue(parameters[name]);
        let matcher = new RegExp(`^${sanitizeRegex(regex)}$`);

        if (!matcher.test(value))
        {
            throw new Error(`Parameter '${name}' must match '${regex}' ('${value}' given).`)
        }

        return token[1] + value;
    });

    return compiled.reverse().join("");
}

/**
 * Stringifies a value for usage as path / query / host parameter or fragment
 */
function stringifyValue (value: string|number|boolean|null|undefined, explicitFalse: boolean = false) : string
{
    if (true === value)
    {
        return "1";
    }

    if (false === value)
    {
        return explicitFalse ? "0" : "";
    }

    return null != value
        ? value.toString()
        : "";
}

/**
 * Generates the query string
 */
function generateQuery (variables: string[], parameters: RouteParameters) : string|null
{
    // use all parameters as default
    let surplus = parameters;

    // set all parameters to undefined that are already "used" as variables
    variables.forEach(name => surplus[name] = undefined);

    // filter all null / undefined parameters
    let filtered: RouteParameters = {};
    for (let name in surplus)
    {
        if (!hasOwnProperty(surplus, name))
        {
            continue;
        }

        if (null != surplus[name] && "_fragment" !== name)
        {
            filtered[name] = stringifyValue(surplus[name], true);
        }
    }

    return Object.keys(filtered).length > 0
        ? encode(filtered, "?")
        : "";
}

/**
 * Generates the fragment part
 */
function generateFragment (parameters: RouteParameters) : string
{
    let fragment = parameters["_fragment"];

    return !fragment
        ? ""
        : "#" + stringifyValue(fragment);
}

/**
 * Router, that generates URLs
 */
export class Router
{
    private context: Context = {
        baseUrl: "",
        host: "",
        ports: DEFAULT_PORTS,
        scheme: "https",
    };
    private routes: RouteCollection = {};


    /**
     * Initializes the router
     */
    public init (data: BecklynJavaScriptRouter.InitData)
    {
        this.context = data.context;
        this.routes = data.routes;
    }


    /**
     * Generates a URL or path for a specific route based on the given parameters.
     */
    public generate (name: string, parameters: RouteParameters = {}, referenceType: ReferenceType = ReferenceType.ABSOLUTE_PATH) : string
    {
        let route = this.routes[name];

        //region Check for missing route
        if (undefined === route)
        {
            throw new Error(`Route not found: '${name}'`);
        }
        //endregion


        //region Check for missing parameters
        let missingParameters = route.variables.filter(
            variable => {
                return undefined === parameters[variable];
            }
        );

        if (missingParameters.length > 0)
        {
            throw new Error(`Failed to generate route '${name}': Some mandatory parameters are missing ("${missingParameters.join('", "')}")`);
        }
        //endregion

        try
        {
            let host = compileTokens(route.host, parameters);
            let segments = [];
            let isMissingRequiredScheme = route.schemes.length > 0 && -1 === route.schemes.indexOf(this.context.scheme);
            let includeScheme = false;
            let scheme = isMissingRequiredScheme
                ? route.schemes[0]
                : this.context.scheme;
            let usedPort = this.context.ports[scheme];
            let needsExplicitPort = usedPort !== undefined && usedPort !== DEFAULT_PORTS[scheme];

            if (referenceType === ReferenceType.ABSOLUTE_URL || isMissingRequiredScheme)
            {
                segments.push(`${scheme}:`);
                includeScheme = true
            }

            if (
                (referenceType === ReferenceType.NETWORK_PATH || includeScheme)
                || ("" !== host && host !== this.context.host)
                || needsExplicitPort
            )
            {
                segments.push("//");
                segments.push(host || this.context.host);

                if (needsExplicitPort)
                {
                    segments.push(":" + usedPort);
                }
            }

            segments.push(this.context.baseUrl);
            segments.push(compileTokens(route.path, parameters));
            segments.push(generateQuery(route.variables, parameters));
            segments.push(generateFragment(parameters));

            return segments.join("");
        }
        catch (e)
        {
            throw new Error(`Failed to generate route '${name}': ${e.message}`);
        }
    }
}
