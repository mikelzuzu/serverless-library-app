import QueryParameterException from "./QueryParameterException"

/**
 * Get value of the limit parameter.
 *
 * @param {Object} event HTTP event passed to a Lambda function
 *
 * @returns {number} parsed "limit" parameter
 */
export function parseLimitParameter(event) {
    const limitStr = getQueryParameter(event, 'limit')
    if (!limitStr) {
        return undefined
    }

    const limit = parseInt(limitStr, 10)
    if (limit <= 0) {
        throw new QueryParameterException('Limit', 'Limit should be positive')
    }

    return limit
}

/**
 * Get value of the limit parameter.
 *
 * @param {Object} event HTTP event passed to a Lambda function
 *
 * @returns {Object} parsed "nextKey" parameter
 */
export function parseNextKeyParameter(event) {
    const nextKeyStr = getQueryParameter(event, 'nextKey')
    if (!nextKeyStr) {
        return undefined
    }

    const uriDecoded = decodeURIComponent(nextKeyStr)
    return JSON.parse(uriDecoded)
}

/**
 * Get value of the query parameter.
 *
 * @param {Object} event HTTP event passed to a Lambda function
 *
 * @returns {Object} parsed "query" parameter for ES
 */
export function parseQueryParameter(event) {
    const query = getQueryParameter(event, 'query')
    if (!query) {
        return undefined
    }

    //const uriDecoded = decodeURIComponent(query)
    return query
}

/**
 * Get a query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 * @param {string} name a name of a query parameter to return
 *
 * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
 */
function getQueryParameter(event, name) {
    const queryParams = event.queryStringParameters
    if (!queryParams) {
        return undefined
    }

    return queryParams[name]
}

/**
 * Encode last evaluated key using
 *
 * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
 *
 * @return {string} URI encoded last evaluated key
 */
export function encodeNextKey(lastEvaluatedKey) {
    if (!lastEvaluatedKey) {
        return null
    }

    return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}